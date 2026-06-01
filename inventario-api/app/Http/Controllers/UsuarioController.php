<?php
namespace App\Http\Controllers;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller{

    //get /api/usuarios 
    public function index(){
        try {
            return response()->json(Usuario::all());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener usuarios: ' . $e->getMessage()], 500);
        }
    }

    //post /api/usuarios - crear nuevo
    public function store(Request $request){
        try {
            $validated = $request->validate([
                'nombre_usuario' => 'required|string',
                'apellido_usuario' => 'required|string',
                'username' => 'required|string|unique:usuarios,username',
                'password_usuario' => 'required|string|min:6',
                'correo_usuario' => 'nullable|email',
                'telefono_usuario' => 'nullable|string',
                'id_tipousuario' => 'nullable|integer',
                'activo' => 'nullable|boolean'
            ]);

            if (!empty($validated['telefono_usuario'])) {
                $soloNumeros = preg_replace('/[^0-9]/', '', $validated['telefono_usuario']);
                if (strlen($soloNumeros) === 8) {
                    $validated['telefono_usuario'] = substr($soloNumeros, 0, 4) . '-' . substr($soloNumeros, 4);
                }
            }

            $usuario = Usuario::create([
                ...$validated,
                'password_usuario' => Hash::make($validated['password_usuario'])
            ]);
            
            return response()->json($usuario, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validación fallida', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al crear usuario: ' . $e->getMessage()], 500);
        }
    }

    //put /api/usuarios/{id} - editar
    public function update(Request $request, $id)
    {
        try {
            $usuario = Usuario::find($id);
            if(!$usuario){
                return response()->json(['error' => 'Usuario no encontrado'], 404);
            }
            
            $validated = $request->validate([
                'nombre_usuario' => 'sometimes|required|string',
                'apellido_usuario' => 'sometimes|required|string',
                'username' => 'sometimes|required|string|unique:usuarios,username,' . $id . ',id_usuario',
                'password_usuario' => 'nullable|string|min:6',
                'correo_usuario' => 'nullable|email',
                'telefono_usuario' => 'nullable|string',
                'id_tipousuario' => 'nullable|integer',
                'activo' => 'nullable|boolean'
            ]);

            $data = $request->all();
            
            if (array_key_exists('telefono_usuario', $data)) {
                if (!empty($data['telefono_usuario'])) {
                    $soloNumeros = preg_replace('/[^0-9]/', '', $data['telefono_usuario']);
                    if (strlen($soloNumeros) === 8) {
                        $data['telefono_usuario'] = substr($soloNumeros, 0, 4) . '-' . substr($soloNumeros, 4);
                    }
                } else {
                    $data['telefono_usuario'] = null;
                }
            }

            if (isset($data['password_usuario']) && $data['password_usuario']) {
                $data['password_usuario'] = Hash::make($data['password_usuario']);
            } else {
                unset($data['password_usuario']);
            }
            
            $usuario->update($data);
            return response()->json($usuario);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validación fallida', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al actualizar: ' . $e->getMessage()], 500);
        }
    }

    //Delete /api/usuario{id} - eliminar
    public function destroy($id){
        try {
            $usuario = Usuario::find($id);
            if(!$usuario){
                return response()->json(['error' => 'Usuario no encontrado'], 404);
            }
            
            $usuario->update(['activo' => false]);
            return response()->json(['mensaje' => 'Usuario desactivado correctamente']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al eliminar: ' . $e->getMessage()], 500);
        }
    }
}