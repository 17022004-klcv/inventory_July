<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class PerfilController extends Controller
{
    // Obtener datos del perfil pasando el ID
    public function show($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }
        return response()->json($user);
    }

    // Actualizar datos del perfil pasando el ID
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre_usuario'   => 'required|string|max:100',
            'apellido_usuario' => 'required|string|max:100',
            'telefono_usuario' => 'nullable|string|max:20',
            // Recuerda cambiar 'users' por tu tabla real si se llama distinto (ej. 'usuarios')
            'correo_usuario'   => 'required|email|unique:users,correo_usuario,' . $user->id_usuario . ',id_usuario',
            'username'         => 'required|string|unique:users,username,' . $user->id_usuario . ',id_usuario',
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