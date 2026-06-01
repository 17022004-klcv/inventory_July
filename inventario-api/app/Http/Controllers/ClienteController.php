<?php
namespace App\Http\Controllers;
use App\Models\Cliente;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    //get api/cliente
    public function index(Request $request){
        $query = Cliente::query();
        
        if ($request->has('buscar') && $request->buscar != '') {
            $buscar = $request->buscar;
            $query->where(function($q) use ($buscar) {
                $q->where('nombre_cliente', 'ilike', "%{$buscar}%")
                  ->orWhere('apellido_cliente', 'ilike', "%{$buscar}%")
                  ->orWhere('telefono_cliente', 'ilike', "%{$buscar}%");
            });
        }
        
        return response()->json($query->where('activo', true)->get());
    }

    //post api/cliente -crear nuevo
    public function store(Request $request){
        try {
            $validated = $request->validate([
                'nombre_cliente' => 'required|string|max:100',
                'apellido_cliente' => 'required|string|max:100',
                'telefono_cliente' => 'nullable|string|max:20',
                'correo_cliente' => 'nullable|email|max:100',
                'activo' => 'nullable|boolean'
            ]);

            if (!empty($validated['telefono_cliente'])) {
                $soloNumeros = preg_replace('/[^0-9]/', '', $validated['telefono_cliente']);
                if (strlen($soloNumeros) === 8) {
                    $validated['telefono_cliente'] = substr($soloNumeros, 0, 4) . '-' . substr($soloNumeros, 4);
                }
            }

            $cliente = Cliente::create($validated);
            return response()->json($cliente, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validación fallida',
                'detalles' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al crear cliente: ' . $e->getMessage()
            ], 500);
        }
    }

    //put api/cliente/{id} -editar
    public function update(Request $request, $id){
        try {
            $cliente = Cliente::find($id);
            if(!$cliente){
                return response()->json(['error' => 'Cliente no encontrado'], 404);
            }

            $validated = $request->validate([
                'nombre_cliente' => 'sometimes|string|max:100',
                'apellido_cliente' => 'sometimes|string|max:100',
                'telefono_cliente' => 'nullable|string|max:20',
                'correo_cliente' => 'nullable|email|max:100',
                'activo' => 'nullable|boolean'
            ]);

            if (array_key_exists('telefono_cliente', $validated)) {
                if (!empty($validated['telefono_cliente'])) {
                    $soloNumeros = preg_replace('/[^0-9]/', '', $validated['telefono_cliente']);
                    if (strlen($soloNumeros) === 8) {
                        $validated['telefono_cliente'] = substr($soloNumeros, 0, 4) . '-' . substr($soloNumeros, 4);
                    }
                } else {
                    $validated['telefono_cliente'] = null;
                }
            }

            $cliente->update($validated);
            return response()->json($cliente, 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validación fallida',
                'detalles' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al actualizar cliente: ' . $e->getMessage()
            ], 500);
        }
    }

    //delete api/cliente/{id} -eliminar (soft delete)
    public function destroy($id){
        try {
            $cliente = Cliente::find($id);
            if(!$cliente){
                return response()->json(['error' => 'Cliente no encontrado'], 404);
            }
            
            // Soft delete: cambiar activo a false
            $cliente->update(['activo' => false]);
            return response()->json(['mensaje' => 'Cliente desactivado correctamente']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al desactivar cliente: ' . $e->getMessage()
            ], 500);
        }
    }
}