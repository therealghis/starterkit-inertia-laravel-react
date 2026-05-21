<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreDueDiligenceTemplateRequest extends FormRequest {
    public function authorize(): bool {
        return $this->user() !== null;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array {
        return [
            'name.required' => 'Il nome è obbligatorio.',
            'name.max' => 'Il nome non può superare i 255 caratteri.',
            'description.string' => 'La descrizione deve essere un testo valido.',
            'is_active.boolean' => 'Il campo attivo deve essere vero o falso.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array {
        return [
            'name' => 'nome',
            'description' => 'descrizione',
            'is_active' => 'attivo',
        ];
    }
}
