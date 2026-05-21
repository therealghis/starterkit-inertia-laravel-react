<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreDueDiligenceCustomItemRequest extends FormRequest {
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
            'company_notes' => ['nullable', 'string'],
            'admin_notes' => ['nullable', 'string'],
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
            'company_notes.string' => 'Le note azienda devono essere un testo valido.',
            'admin_notes.string' => 'Le note amministratore devono essere un testo valido.',
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
            'company_notes' => 'note azienda',
            'admin_notes' => 'note amministratore',
        ];
    }
}
