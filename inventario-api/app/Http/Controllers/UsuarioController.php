<?php
namespace App\Http\Controllers;
use App\Models\Usuario;
use Illuminate\Http\Request;

class UsuarioController extends Controller{

    //get /api/usuarios 
    public function index(){
        return response()->json(Usuario::all());
    }

    //post /api/usuarios - crear nuevo
    public function store(Request $request){
        $usuario = Usuario::create($request->all());
        return response() ->json($usuario, 201);
    }

    //put /api/usuarios/{id} - editar
    public function update(Request $request, $id)
    {
        $usuario = Usuario::find($id);
        if(!$usuario){
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }
        $usuario->update($request->all());
        return response()->json($usuario);
    }

    //Delete /api/usuario{id} - eliminar
    public function destroy($id){
        $usuario = Usuario::find($id);
        if(!$usuario){
            return response()->json(['error' => 'Uusario no encontrado'], 404);
        }
        $usuario->delete();
        return response()->json(['mensaje' => 'Usuario eliminado']);
    }
}