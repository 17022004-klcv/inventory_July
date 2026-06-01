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
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id('id_usuario');
            $table->string('nombre_usuario')->nullable();
            $table->string('apellido_usuario')->nullable();
            $table->string('telefono_usuario')->nullable();
            $table->string('correo_usuario')->nullable();
            $table->string('username')->unique();
            $table->string('password_usuario');
            $table->unsignedTinyInteger('id_tipousuario')->default(2); // 1=admin, 2=usuario
            $table->boolean('activo')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
