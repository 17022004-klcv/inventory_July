<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoriaController extends Controller
{
    //get
    public function index(){
        return response()->json(Categoria::all());
    }

    //post
    public function store(Request $request){
        $validator = Validator::make($request->all(), [
            'nombre_categoria' => 'required|string|max:100|unique:categorias,nombre_categoria',
            'descripcion_categoria' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $categoria = Categoria::create($request->all());
        return response()->json($categoria, 201);
    }

    //put
    public function update(Request $request, $id){
        $categoria = Categoria::find($id);
        if(!$categoria){
            return response()->json(['error' => 'Categoria no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre_categoria' => 'required|string|max:100|unique:categorias,nombre_categoria,' . $id . ',id_categoria',
            'descripcion_categoria' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $categoria->update($request->all());
        return response()->json($categoria);
    }

    // delete
    public function destroy($id){
        $categoria = Categoria::find($id);
        if(!$categoria){
            return response()->json(['error'=> 'Categoria no encontrada'], 404);
        }

        $categoria->delete();
        return response()->json(['mensaje' => 'Categoria eliminada']);
    }
}