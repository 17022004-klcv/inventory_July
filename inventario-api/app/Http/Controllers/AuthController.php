<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $usuario = $request->input('username');
        $contrasena = $request->input('password_usuario');

        $user = DB::table('usuarios')
                  ->where('username', $usuario)
                  ->first();

        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 401);
        }

        if ($user->password_usuario !== $contrasena) {
            return response()->json(['error' => 'Contraseña incorrecta'], 401);
        }

        return response()->json([
            'mensaje' => 'Login exitoso',
            'usuario' => $user
        ]);
    }
}