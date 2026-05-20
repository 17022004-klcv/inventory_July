<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Venta extends Model
{
    protected $table = 'ventas';
    protected $primaryKey = 'id_venta';
    public $timestamps = false;

    protected $fillable = [
        'fecha_venta',
        'id_usuario',
        'id_cliente',
        'total_venta',
        'estado'
    ];

    public function detalles(){
        return $this->hasMany(DetalleVenta::class, 'id_venta');

    }
}