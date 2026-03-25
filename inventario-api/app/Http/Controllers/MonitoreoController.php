<?php
namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;

class MonitoreoController extends Controller
{
    public function index()
    {
        $logs = DB::table('logs')
            ->join('usuarios', 'logs.id_usuario', '=', 'usuarios.id_usuario')
            ->select(
                'logs.*',
                'usuarios.nombre_usuario',
                'usuarios.apellido_usuario'
            )
            ->orderBy('logs.fecha', 'desc')
            ->limit(100)
            ->get();

        return response()->json($logs);
    }
}