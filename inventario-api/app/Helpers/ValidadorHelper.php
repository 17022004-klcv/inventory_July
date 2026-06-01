<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Validator;

class ValidadorHelper
{
    /**
     * Valida de forma estricta los datos comunes de la app (Vacíos, correos, etc.)
     * Devuelve los errores si falla, o null si todo está perfecto.
     */
    public static function validarCampos(array $datos, array $reglasAdicionales = [])
    {
        // Reglas base que casi siempre usas para formularios de personas
        $reglasBase = [
            'nombre_usuario'   => 'sometimes|required|string|max:100',
            'apellido_usuario' => 'sometimes|required|string|max:100',
            'correo_usuario'   => 'sometimes|required|email',
            'username'         => 'sometimes|required|string',
        ];

        // Fusionamos con reglas específicas que le pases (como contraseñas o llaves únicas)
        $reglasFinales = array_merge($reglasBase, $reglasAdicionales);

        $validator = Validator::make($datos, $reglasFinales);

        if ($validator->fails()) {
            return $validator->errors();
        }

        return null; // Todo limpio
    }

    /**
     * Formatea un número de teléfono para que tenga el formato 1234-5678 de forma automática.
     * Limpia espacios, letras y caracteres raros.
     */
    public static function formatearTelefono($telefono)
    {
        if (empty($telefono)) {
            return null;
        }

        // 1. Eliminar cualquier cosa que no sea un número
        $soloNumeros = preg_replace('/[^0-9]/', '', $telefono);

        // 2. Si tiene 8 dígitos (formato estándar de muchos países), le metemos el guion en medio
        if (strlen($soloNumeros) === 8) {
            return substr($soloNumeros, 0, 4) . '-' . substr($soloNumeros, 4);
        }

        // Si tiene otra longitud (ej. con código de área), lo dejamos limpio numéricamente
        return $soloNumeros;
    }
}