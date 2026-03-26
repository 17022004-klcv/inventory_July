<?php

namespace App\Http\Controllers;
use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    //get
    public function index(){
        return response()->json(Categoria::all());
    }

    //post
    public function store(Request $request){
        $categoria = Categoria::create($request->all());
        return response()->json($categoria, 201);
    }

    //put
    public function update(Request $request, $id){
        $categoria = Categoria::find($id);
        if(!$categoria){
            return response()->json(['error' => 'Categoria no encontrada']);
        }

        $categoria->update($request->all());
        return response()->json($categoria);
    }

    // delete
    public function destroy($id){
        $categoria = Categoria::find($id);
        if(!$categoria){
            return response()->json(['error'=> 'Categoria no encontrada']);
        }

        $categoria->delete();
        return response()->json(['mensaje' => 'Categoria eliminada']);
    }
}
