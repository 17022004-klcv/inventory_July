<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductoRequest;
use App\Models\Productos;

class ProductosController extends Controller
{
    /*get api/productos - listar todos
    public function index(){
    return response()->json(Productos::with(['categoria', 'proveedor'])->get());
}*/

    public function index()
    {
        return response()->json(Productos::with(['categoria', 'proveedor'])->where('activo', true)->get());
    }

    //post api/productos
    public function store(ProductoRequest $request)
    {
        $producto = Productos::create($request->validated());
        return response()->json($producto, 201);
    }

    //put api/productos/{id}
    public function update(ProductoRequest $request, $id)
    {
        $producto = Productos::find($id);
        if (!$producto) {
            return response()->json(['error' => 'Producto no encontrado'], 404);
        }
        $producto->update($request->validated());
        return response()->json($producto);
    }

    //delete
    public function destroy($id)
    {
        $producto = Productos::find($id);
        if (!$producto) {
            return response()->json(['error' => 'Producto no encontrado'], 404);
        }

        $producto->activo = false;
        $producto->save();

        return response()->json(['mensaje' => 'Producto desactivado'], 200);
    }
}
