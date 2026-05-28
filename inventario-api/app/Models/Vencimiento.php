<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vencimiento extends Model
{
    protected $table = 'vencimiento';
    protected $primaryKey = 'id_vencimiento';
    public $timestamps = false;

    protected $fillable = [
        'lote',
        'fecha_vencimiento',
        'id_producto'
    ];

    public function producto()
    {
        return $this->belongsTo(Productos::class, 'id_producto', 'id_producto');
    }
}