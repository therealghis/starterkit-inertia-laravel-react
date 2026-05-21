<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDueDiligenceTemplateItemRequest extends FormRequest {
    public function authorize(): bool {
        return $this->user() !== null;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array {
        return [
            'entity' => ['required', 'string', 'max:255'],
            'topic' => ['required', 'string', 'max:255'],
            'request_text' => ['required', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array {
        return [
            'entity.required' => "L'entità è obbligatoria.",
            'entity.max' => "L'entità non può superare i 255 caratteri.",
            'topic.required' => 'Il topic è obbligatorio.',
            'topic.max' => 'Il topic non può superare i 255 caratteri.',
            'request_text.required' => 'Il testo richiesta è obbligatorio.',
            'sort_order.integer' => "L'ordinamento deve essere un numero intero.",
            'sort_order.min' => "L'ordinamento non può essere negativo.",
            'is_active.boolean' => 'Il campo attivo deve essere vero o falso.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array {
        return [
            'entity' => 'entità',
            'topic' => 'topic',
            'request_text' => 'testo richiesta',
            'sort_order' => 'ordinamento',
            'is_active' => 'attivo',
        ];
    }
}
