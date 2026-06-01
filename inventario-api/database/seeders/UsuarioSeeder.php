<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('usuarios')->insert([
            'nombre_usuario' => 'Admin',
            'apellido_usuario' => 'System',
            'telefono_usuario' => '0000000000',
            'correo_usuario' => 'admin@inventario.com',
            'username' => 'admin',
            'password_usuario' => Hash::make('admin123'),
            'id_tipousuario' => 1, // 1 = admin
            'activo' => true,
        ]);
    }
}
