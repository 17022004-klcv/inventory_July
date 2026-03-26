<?php
namespace App\Http\Controllers;
use App\Models\Cliente;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    //get api/cliente
    public function index(){
        return response() ->json(Cliente::all());
    }

    //post api/cliente -crear nuevo
    public function store(Request $request){
        $cliente = Cliente::create($request->all());
        return response()->json($cliente, 201);
    }

    //put api/cliente{id} -editar
    public function update(Request $request, $id){
        $cliente = Cliente::find($id);
        if(!$cliente){
            return response() -> json(['error' => 'Cliente no encontrado']);
        }
        $cliente -> update($request -> all());
        return response() -> json($cliente);
    }

    //delte api/cliente{id} -eliminar
    public function destroy($id){
        $cliente = Cliente::find($id);

        if(!$cliente){
            return response() -> json(['error' => 'Cleinte no encontrado']);
        }
        $cliente -> delete();
        return response() -> json(['mensaje' => 'Cliente eliminado']);
    }
}
