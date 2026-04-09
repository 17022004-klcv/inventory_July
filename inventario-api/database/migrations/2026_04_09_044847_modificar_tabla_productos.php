<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::table('productos', function (Blueprint $table) {
        // renombrar la columna id a id_producto
        $table->renameColumn('id', 'id_producto');
        
        // agregar las columnas que faltan
        $table->string('nombre_producto', 255);
        $table->unsignedBigInteger('id_categoria');
        $table->integer('stock')->default(0);
        $table->decimal('precio_unitario', 8, 2);
        $table->decimal('precio_final', 8, 2);
        $table->unsignedBigInteger('id_proveedor');
        $table->boolean('activo')->default(true);
        $table->timestamp('updated_at')->nullable();

        $table->foreign('id_categoria')->references('id_categoria')->on('categorias');
        $table->foreign('id_proveedor')->references('id_proveedor')->on('proveedores');
    });
}

public function down(): void
{
    Schema::table('productos', function (Blueprint $table) {
        $table->dropForeign(['id_categoria']);
        $table->dropForeign(['id_proveedor']);
        $table->dropColumn([
            'nombre_producto', 'id_categoria', 'stock',
            'precio_unitario', 'precio_final', 'id_proveedor',
            'activo', 'updated_at'
        ]);
    });
}
};
