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

            // Crear directorio si no existe
            if (!is_dir(storage_path('app/backups'))) {
                mkdir(storage_path('app/backups'), 0755, true);
            }

            // Setear contraseña para pg_dump
            putenv("PGPASSWORD={$dbPass}");

            // Ejecutar pg_dump - esto incluye TODO: esquema, datos, secuencias, etc.
            $comando = "\"{$pgDump}\" -h {$dbHost} -p {$dbPort} -U {$dbUser} -d {$dbName} -f \"{$rutaTemporal}\" 2>&1";
            exec($comando, $output, $codigoRetorno);

            if ($codigoRetorno !== 0) {
                return response()->json([
                    'error' => 'Error al generar el backup: ' . implode("\n", $output)
                ], 500);
            }

            // Verificar que el archivo se creó correctamente
            if (!file_exists($rutaTemporal) || filesize($rutaTemporal) === 0) {
                return response()->json([
                    'error' => 'El archivo de backup está vacío o no se creó correctamente'
                ], 500);
            }

            // Leer el archivo SQL generado
            $contenidoSql = file_get_contents($rutaTemporal);

            // Cifrar el contenido
            $contenidoCifrado = Crypto::encrypt($contenidoSql, $this->getKey());

            // Guardar archivo cifrado
            $nombreCifrado = "backup_{$fecha}.sql.enc";
            Storage::put("backups/{$nombreCifrado}", $contenidoCifrado);

            // Eliminar archivo temporal sin cifrar
            unlink($rutaTemporal);

            // Obtener lista de tablas para el log
            $tablas = \Illuminate\Support\Facades\DB::select("
                SELECT tablename FROM pg_tables WHERE schemaname = 'public'
            ");
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
            return response()->json([
                'error' => 'Error: ' . $e->getMessage()
            ], 500);
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

        // 1. Descifrar el archivo
        $contenidoCifrado = Storage::get($ruta);
        $contenidoSql     = Crypto::decrypt($contenidoCifrado, $this->getKey());

        // 2. Guardar temporalmente
        $rutaTemporal = storage_path('app/backups/restore_temp.sql');
        file_put_contents($rutaTemporal, $contenidoSql);

        // ==========================================================
        // 🔥 PASO CRÍTICO: EXPULSAR OTRAS CONEXIONES DE POSTGRESQL
        // ==========================================================
        // Esto desconecta a cualquier otra app o hilos colgados para evitar Deadlocks
        \Illuminate\Support\Facades\DB::statement("
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = ?
              AND pid <> pg_backend_pid();
        ", [$dbName]);

        // Cerrar la conexión actual de Laravel temporalmente para liberar la BD por completo
        \Illuminate\Support\Facades\DB::disconnect();

        // 3. Ejecutar la restauración mediante psql
        putenv("PGPASSWORD={$dbPass}");
        set_time_limit(300); // 5 minutos de tiempo límite

        $comando = "\"{$psql}\" -h {$dbHost} -p {$dbPort} -U {$dbUser} -d {$dbName} -f \"{$rutaTemporal}\" 2>&1";
        exec($comando, $output, $codigoRetorno);

        // Eliminar el archivo temporal descifrado inmediatamente por seguridad
        if (file_exists($rutaTemporal)) {
            unlink($rutaTemporal);
        }

        if ($codigoRetorno !== 0) {
            return response()->json([
                'error' => 'Error al ejecutar psql: ' . implode("\n", $output)
            ], 500);
        }

        // ==========================================================
        // RECONECTAR Y ALINEAR SECUENCIAS AUTOMÁTICAMENTE
        // ==========================================================
        \Illuminate\Support\Facades\DB::reconnect();
        
        $this->corregirSecuenciasPostgres();

        // ==========================================================
        // EJECUTAR MIGRACIONES FALTANTES
        // ==========================================================
        // Esto asegura que todas las tablas necesarias existan
        try {
            \Illuminate\Support\Facades\Artisan::call('migrate', [
                '--force' => true,
                '--database' => 'pgsql'
            ]);
        } catch (\Exception $migrateError) {
            // Si las migraciones fallan, lo registramos pero continuamos
            \Illuminate\Support\Facades\Log::warning('Migraciones parcialmente aplicadas: ' . $migrateError->getMessage());
        }

        // Limpiar cachés de Laravel
        \Illuminate\Support\Facades\Artisan::call('cache:clear');

        return response()->json([
            'mensaje' => 'Base de datos restaurada, migraciones ejecutadas y secuencias corregidas con éxito.'
        ]);

    } catch (\Exception $e) {
        return response()->json(['error' => 'Excepción interna: ' . $e->getMessage()], 500);
    }
}

/**
 * Corrige las secuencias desalineadas en PostgreSQL de forma dinámica.
 */
private function corregirSecuenciasPostgres()
{
    // Esta consulta busca todas las tablas con columnas autoincrementables y genera el SQL para actualizarlas
    $query = "
        SELECT 'SELECT setval(''' || pg_get_serial_sequence(table_name, column_name) || ''', COALESCE(MAX(' || quote_ident(column_name) || '), 0) + 1, false) FROM ' || quote_ident(table_name) || ';' AS sql_comando
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND pg_get_serial_sequence(table_name, column_name) IS NOT NULL;
    ";

    $secuencias = \Illuminate\Support\Facades\DB::select($query);

    // Ejecutar cada comando generado
    foreach ($secuencias as $secuencia) {
        if (!empty($secuencia->sql_comando)) {
            \Illuminate\Support\Facades\DB::executeStatement($secuencia->sql_comando);
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