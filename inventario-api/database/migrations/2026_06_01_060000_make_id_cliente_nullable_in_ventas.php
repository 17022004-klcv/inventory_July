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
        Schema::table('ventas', function (Blueprint $table) {
            // Primero eliminamos la restricción de FK
            $table->dropForeign(['id_cliente']);
            
            // Hacemos la columna nullable
            $table->unsignedBigInteger('id_cliente')->nullable()->change();
            
            // Volvemos a agregar la FK pero ahora permite NULL
            $table->foreign('id_cliente')->references('id_cliente')->on('clientes')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            $table->dropForeign(['id_cliente']);
            $table->unsignedBigInteger('id_cliente')->nullable(false)->change();
            $table->foreign('id_cliente')->references('id_cliente')->on('clientes')->onDelete('restrict');
        });
    }
};
