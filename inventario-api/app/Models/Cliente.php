<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $table = 'clientes';
    protected $primaryKey = 'id_cliente';
    public $timestamps = false;

    protected $fillable = [
        'nombre_cliente',
        'apellido_cliente',
        'telefono_cliente',
        'correo_cliente',
        'activo'
    ];
}
