<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Defuse\Crypto\Crypto;
use Defuse\Crypto\Key;

class BackupController extends Controller
{
    private function getKey(): Key
    {
        return Key::loadFromAsciiSafeString(env('BACKUP_ENCRYPTION_KEY'));
    }

  // POST api/backup/crear
    public function crear()
    {
        try {
            $dbName   = env('DB_DATABASE');
            $dbUser   = env('DB_USERNAME');
            $dbPass   = env('DB_PASSWORD');
            $dbHost   = env('DB_HOST');
            $dbPort   = env('DB_PORT', 5432);
            $pgDump   = 'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe';
            $fecha    = now()->format('Y-m-d_H-i-s');
            $nombreArchivo = "backup_{$fecha}.sql";
            $rutaTemporal  = storage_path("app/backups/{$nombreArchivo}");

            if (!is_dir(storage_path('app/backups'))) {
                mkdir(storage_path('app/backups'), 0755, true);
            }

            putenv("PGPASSWORD={$dbPass}");

            // 🌟 CAMBIO CLAVE: Agregamos --clean y --if-exists para que el archivo SQL sepa autodestruir 
            // las tablas actuales antes de reinsertar los datos del backup.
            $comando = "\"{$pgDump}\" -h {$dbHost} -p {$dbPort} -U {$dbUser} -d {$dbName} -E utf8 --clean --if-exists -f \"{$rutaTemporal}\" 2>&1";
            exec($comando, $output, $codigoRetorno);

            if ($codigoRetorno !== 0) {
                return response()->json(['error' => 'Error al generar el backup: ' . implode("\n", $output)], 500);
            }

            if (!file_exists($rutaTemporal) || filesize($rutaTemporal) === 0) {
                return response()->json(['error' => 'El archivo de backup está vacío'], 500);
            }

            $contenidoSql = file_get_contents($rutaTemporal);
            $contenidoCifrado = Crypto::encrypt($contenidoSql, $this->getKey());
            $nombreCifrado = "backup_{$fecha}.sql.enc";
            Storage::put("backups/{$nombreCifrado}", $contenidoCifrado);
            unlink($rutaTemporal);

            $tablas = \Illuminate\Support\Facades\DB::select("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
            $nombresTablas = array_map(fn($t) => $t->tablename, $tablas);

            return response()->json([
                'mensaje'  => 'Backup creado correctamente',
                'archivo'  => $nombreCifrado,
                'fecha'    => $fecha,
                'tamanio'  => Storage::size("backups/{$nombreCifrado}"),
                'tablas_incluidas' => $nombresTablas,
                'cantidad_tablas' => count($nombresTablas)
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // POST api/backup/restaurar/{nombre}
    public function restaurar($nombre)
    {
        try {
            $ruta = "backups/{$nombre}";

            if (!Storage::exists($ruta)) {
                return response()->json(['error' => 'Backup no encontrado'], 404);
            }

            $dbName  = env('DB_DATABASE');
            $dbUser  = env('DB_USERNAME');
            $dbPass  = env('DB_PASSWORD');
            $dbHost  = env('DB_HOST');
            $dbPort  = env('DB_PORT', 5432);
            $psql    = 'C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe';

            $contenidoCifrado = Storage::get($ruta);
            $contenidoSql     = Crypto::decrypt($contenidoCifrado, $this->getKey());

            $rutaTemporal = storage_path('app/backups/restore_temp.sql');
            file_put_contents($rutaTemporal, $contenidoSql, LOCK_EX);

            // Expulsar conexiones colgadas
            // ==========================================================
        // 🔥 PASO CRÍTICO: EXPULSAR OTRAS CONEXIONES DE POSTGRESQL
        // ==========================================================
        \Illuminate\Support\Facades\DB::statement("
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = ?
              AND pid <> pg_backend_pid();
        ", [$dbName]);

        // 🌟 CORRECCIÓN AQUÍ: Separamos los comandos en dos declaraciones individuales
        \Illuminate\Support\Facades\DB::statement("DROP SCHEMA IF EXISTS public CASCADE;");
        \Illuminate\Support\Facades\DB::statement("CREATE SCHEMA public;");

        // Cerrar la conexión actual de Laravel para que psql pueda tomar el control total
        \Illuminate\Support\Facades\DB::disconnect();

        // 3. Ejecutar la restauración mediante psql (Nativo de Windows sin problemas de caracteres)
        set_time_limit(300);

        // En Windows CMD, para usar PGPASSWORD de forma segura con comillas si tiene caracteres raros:
        // Usamos la ruta del archivo temporal directamente.
        $comando = "set \"PGPASSWORD={$dbPass}\" && \"{$psql}\" -h {$dbHost} -p {$dbPort} -U {$dbUser} -d {$dbName} --set ON_ERROR_STOP=1 -f \"{$rutaTemporal}\" 2>&1";
        
        exec($comando, $output, $codigoRetorno);

        // Eliminar el archivo temporal descifrado inmediatamente por seguridad
        if (file_exists($rutaTemporal)) {
            unlink($rutaTemporal);
        }

        // 🌟 SI FALLA, AYÚDAME A VER EL LOG: Guardamos el error exacto que da la consola de Windows
        if ($codigoRetorno !== 0) {
            \Illuminate\Support\Facades\DB::reconnect(); // Reconectamos para no romper Laravel
            $errorConsola = mb_convert_encoding(implode(" | ", $output), 'UTF-8', 'ISO-8859-1');
            \Illuminate\Support\Facades\Log::error("Error psql Windows: " . $errorConsola);
            
            return response()->json([
                'error' => 'El vaciado fue exitoso, pero psql no pudo escribir. Detalles: ' . substr($errorConsola, 0, 100)
            ], 500);
        }

            \Illuminate\Support\Facades\DB::reconnect();
            $this->corregirSecuenciasPostgres();

            try {
                \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true, '--database' => 'pgsql']);
            } catch (\Exception $migrateError) {
                \Illuminate\Support\Facades\Log::warning('Migraciones post-backup: ' . $migrateError->getMessage());
            }

            \Illuminate\Support\Facades\Artisan::call('cache:clear');

            return response()->json([
                'mensaje' => 'Base de datos restaurada, tablas regeneradas y secuencias corregidas con éxito.'
            ]);

        } catch (\Exception $e) {
            $msgError = mb_convert_encoding($e->getMessage(), 'UTF-8', 'UTF-8');
            return response()->json(['error' => 'Excepción interna: ' . $msgError], 500);
        }
    }

    // GET api/backup/listar
    public function listar()
    {
        try {
            $archivos = Storage::files('backups');
            $backups  = collect($archivos)->map(function ($archivo) {
                $nombre = basename($archivo);
                return [
                    'nombre'   => $nombre,
                    'tamanio'  => Storage::size($archivo),
                    'fecha'    => Storage::lastModified($archivo),
                ];
            })->sortByDesc('fecha')->values();

            return response()->json($backups);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // GET api/backup/descargar/{nombre}
public function descargar($nombre)
{
    try {
        $ruta = "backups/{$nombre}";

        if (!Storage::exists($ruta)) {
            return response()->json(['error' => 'Backup no encontrado'], 404);
        }

        // Enviar el archivo cifrado directamente sin descifrar
        $contenidoCifrado = Storage::get($ruta);

        return response($contenidoCifrado, 200, [
            'Content-Type'        => 'application/octet-stream',
            'Content-Disposition' => "attachment; filename=\"{$nombre}\"",
        ]);

    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}


/**
 * Corrige las secuencias desalineadas en PostgreSQL de forma dinámica.
 */
/**
 * Corrige las secuencias desalineadas en PostgreSQL de forma dinámica.
 */
private function corregirSecuenciasPostgres()
{
    // Genera el comando SQL exacto para nivelar los contadores (IDs) de cada tabla
    $query = "
        SELECT 'SELECT setval(''' || pg_get_serial_sequence(table_name, column_name) || ''', COALESCE(MAX(' || quote_ident(column_name) || '), 0) + 1, false) FROM ' || quote_ident(table_name) || ';' AS sql_comando
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND pg_get_serial_sequence(table_name, column_name) IS NOT NULL;
    ";

    $secuencias = \Illuminate\Support\Facades\DB::select($query);

    // 🌟 CORRECCIÓN AQUÍ: Cambiamos executeStatement por statement
    foreach ($secuencias as $secuencia) {
        if (!empty($secuencia->sql_comando)) {
            \Illuminate\Support\Facades\DB::statement($secuencia->sql_comando);
        }
    }
}

    // DELETE api/backup/eliminar/{nombre}
    public function eliminar($nombre)
    {
        try {
            $ruta = "backups/{$nombre}";
            if (!Storage::exists($ruta)) {
                return response()->json(['error' => 'Backup no encontrado'], 404);
            }
            Storage::delete($ruta);
            return response()->json(['mensaje' => 'Backup eliminado correctamente']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}