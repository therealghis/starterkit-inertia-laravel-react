<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDueDiligenceRequest extends FormRequest {
    public function authorize(): bool {
        return $this->user() !== null;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array {
        return [
            'title' => ['required', 'string', 'max:255'],
            'year' => ['nullable', 'integer', 'digits:4', 'min:1900', 'max:2100'],
            'due_diligence_template_id' => [
                'required',
                'integer',
                Rule::exists('due_diligence_templates', 'id')->where('is_active', true),
            ],
            'company_notes' => ['nullable', 'string'],
            'admin_notes' => ['nullable', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array {
        return [
            'title.required' => 'Il titolo è obbligatorio.',
            'due_diligence_template_id.required' => 'Il template due diligence è obbligatorio.',
            'due_diligence_template_id.exists' => 'Il template due diligence selezionato non è valido o non è attivo.',
            'year.digits' => "L'anno deve contenere 4 cifre.",
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array {
        return [
            'title' => 'titolo',
            'year' => 'anno',
            'due_diligence_template_id' => 'template due diligence',
            'company_notes' => 'note azienda',
            'admin_notes' => 'note amministratore',
        ];
    }
}
