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
        Schema::create('ventas', function (Blueprint $table) {
            $table->id('id_venta');
            $table->timestamp('fecha_venta')->useCurrent();
            $table->unsignedBigInteger('id_usuario');
            $table->unsignedBigInteger('id_cliente');
            $table->decimal('total_venta', 10, 2);
            $table->string('estado')->default('Completada');
            
            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->onDelete('restrict');
            $table->foreign('id_cliente')->references('id_cliente')->on('clientes')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ventas');
    }
};
