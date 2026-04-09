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
        if (!Schema::hasTable('proveedores')) {
            Schema::create('proveedores', function (Blueprint $table) {
                $table->id('id_proveedor');
                $table->string('nombre_proveedor');
                $table->string('direccion_proveedor')->nullable();
                $table->string('telefono_proveedor')->nullable();
                $table->string('correo_proveedor')->nullable();
                $table->boolean('activo')->default(true);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proveedores');
    }
};
