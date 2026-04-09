<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
         $isUpdate = $this->isMethod('put') || $this->isMethod('patch');

        return [
            'nombre_producto' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:255'],
            'id_categoria'    => [$isUpdate ? 'sometimes' : 'required', 'exists:categorias,id_categoria'],
            'id_proveedor'    => [$isUpdate ? 'sometimes' : 'required', 'exists:proveedores,id_proveedor'],
            'stock'           => [$isUpdate ? 'sometimes' : 'required', 'integer', 'min:0'],
            'precio_unitario' => [$isUpdate ? 'sometimes' : 'required', 'numeric', 'min:0'],
            'precio_final'    => [$isUpdate ? 'sometimes' : 'required', 'numeric', 'min:0'],
            'activo'          => 'boolean',
        ];
    }
}
