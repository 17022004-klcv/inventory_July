<?php
namespace App\Http\Controllers;
use App\Models\Proveedor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
        $validator = Validator::make($request->all(), [
            'nombre_proveedor' => 'required|string|max:100',
            'contacto_proveedor' => 'nullable|string|max:100',
            'telefono_proveedor' => 'nullable|string|max:20',
            'correo_proveedor' => 'nullable|email|max:100',
            'direccion_proveedor' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $datos = $request->all();
        
        if (!empty($datos['telefono_proveedor'])) {
            $soloNumeros = preg_replace('/[^0-9]/', '', $datos['telefono_proveedor']);
            if (strlen($soloNumeros) === 8) {
                $datos['telefono_proveedor'] = substr($soloNumeros, 0, 4) . '-' . substr($soloNumeros, 4);
            }
        }

        $proveedor = Proveedor::create($datos);
        return response()->json($proveedor, 201);
    }

    // PUT /api/proveedores/{id} — editar
    public function update(Request $request, $id)
    {
        $proveedor = Proveedor::find($id);
        if (!$proveedor) {
            return response()->json(['error' => 'Proveedor no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre_proveedor' => 'required|string|max:100',
            'contacto_proveedor' => 'nullable|string|max:100',
            'telefono_proveedor' => 'nullable|string|max:20',
            'correo_proveedor' => 'nullable|email|max:100',
            'direccion_proveedor' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $datos = $request->all();

        if (isset($datos['telefono_proveedor'])) {
            if (!empty($datos['telefono_proveedor'])) {
                $soloNumeros = preg_replace('/[^0-9]/', '', $datos['telefono_proveedor']);
                if (strlen($soloNumeros) === 8) {
                    $datos['telefono_proveedor'] = substr($soloNumeros, 0, 4) . '-' . substr($soloNumeros, 4);
                }
            } else {
                $datos['telefono_proveedor'] = null;
            }
        }

        $proveedor->update($datos);
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