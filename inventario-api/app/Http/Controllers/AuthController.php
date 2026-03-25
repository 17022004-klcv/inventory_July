<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $usuario  = $request->input('username');
        $contrasena = $request->input('password_usuario');
        $ip = $request->ip();

        // ── 1. Buscar usuario ──────────────────────────
        $user = DB::table('usuarios')
                  ->where('username', $usuario)
                  ->first();

        // ── 2. Usuario no existe ───────────────────────
        if (!$user) {
            DB::table('logs')->insert([
                'id_usuario'     => 1, // no hay usuario identificado
                'fecha'          => now(),
                'accion'         => 'LOGIN_FALLIDO',
                'tabla_afectada' => 'usuarios',
                'ip_origen'      => $ip,
                'detalle_json'   => json_encode([
                    'username' => $usuario,
                    'motivo'   => 'Usuario no encontrado'
                ])
            ]);
            return response()->json(['error' => 'Usuario no encontrado'], 401);
        }

        // ── 3. Contraseña incorrecta ───────────────────
        if ($user->password_usuario !== $contrasena) {
            DB::table('logs')->insert([
                'id_usuario'     => $user->id_usuario,
                'fecha'          => now(),
                'accion'         => 'LOGIN_FALLIDO',
                'tabla_afectada' => 'usuarios',
                'ip_origen'      => $ip,
                'detalle_json'   => json_encode([
                    'username' => $usuario,
                    'motivo'   => 'Contraseña incorrecta'
                ])
            ]);
            return response()->json(['error' => 'Contraseña incorrecta'], 401);
        }

        // ── 4. Login exitoso ───────────────────────────
        // Setear variable de sesión para que el trigger sepa qué usuario hizo cambios
        DB::statement("SET myapp.current_user_id = '{$user->id_usuario}'");

        DB::table('logs')->insert([
            'id_usuario'     => $user->id_usuario,
            'fecha'          => now(),
            'accion'         => 'LOGIN_EXITOSO',
            'tabla_afectada' => 'usuarios',
            'ip_origen'      => $ip,
            'detalle_json'   => json_encode(['username' => $usuario])
        ]);

        return response()->json([
            'mensaje' => 'Login exitoso',
            'usuario' => $user
        ]);
    }
}