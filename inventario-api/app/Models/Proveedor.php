<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Proveedor extends Model
{
    protected $table = 'proveedores';
    protected $primaryKey = 'id_proveedor';
    public $timestamps = false;

    protected $fillable = [
        'nombre_proveedor',
        'direccion_proveedor',
        'telefono_proveedor',
        'correo_proveedor',
        'activo'
    ];
}