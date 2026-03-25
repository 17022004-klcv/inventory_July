<?php
namespace App\Http\Controllers;
use App\Models\Proveedor;
use Illuminate\Http\Request;

class ProveedorController extends Controller
{
    // GET /api/proveedores — listar todos
    public function index()
    {
        return response()->json(Proveedor::all());
    }

    // POST /api/proveedores — crear nuevo
    public function store(Request $request)
    {
        $proveedor = Proveedor::create($request->all());
        return response()->json($proveedor, 201);
    }

    // PUT /api/proveedores/{id} — editar
    public function update(Request $request, $id)
    {
        $proveedor = Proveedor::find($id);
        if (!$proveedor) {
            return response()->json(['error' => 'Proveedor no encontrado'], 404);
        }
        $proveedor->update($request->all());
        return response()->json($proveedor);
    }

    // DELETE /api/proveedores/{id} — eliminar
    public function destroy($id)
    {
        $proveedor = Proveedor::find($id);
        if (!$proveedor) {
            return response()->json(['error' => 'Proveedor no encontrado'], 404);
        }
        $proveedor->delete();
        return response()->json(['mensaje' => 'Proveedor eliminado']);
    }
}