<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false;

    protected $fillable = [
        'nombre_usuario',
        'apellido_usuario',
        'telefono_usuario',
        'correo_usuario',
        'password_usuario',
        'id_tipousuario',
        'activo',
        'username'
    ];
}