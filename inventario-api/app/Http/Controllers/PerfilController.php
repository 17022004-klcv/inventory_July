<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario; // 🌟 Asegúrate de que llame a tu modelo Usuario
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class PerfilController extends Controller
{
    public function show($id)
    {
        // Usa Usuario en lugar de User
        $user = Usuario::find($id);
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = Usuario::find($id);
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre_usuario'   => 'required|string|max:100',
            'apellido_usuario' => 'required|string|max:100',
            'telefono_usuario' => 'nullable|string|max:20',
            'correo_usuario'   => 'required|email|unique:usuarios,correo_usuario,' . $user->id_usuario . ',id_usuario',
            'username'         => 'required|string|unique:usuarios,username,' . $user->id_usuario . ',id_usuario',
            'password'         => 'nullable|string|min:6|confirmed', 
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->nombre_usuario = $request->nombre_usuario;
        $user->apellido_usuario = $request->apellido_usuario;
        $user->telefono_usuario = $request->telefono_usuario;
        $user->correo_usuario = $request->correo_usuario;
        $user->username = $request->username;

        if ($request->filled('password')) {
            $user->password_usuario = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'user' => $user
        ]);
    }
}