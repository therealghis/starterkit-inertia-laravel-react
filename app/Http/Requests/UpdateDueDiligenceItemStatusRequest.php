<?php

namespace App\Http\Requests;

use App\Enums\DueDiligenceItemStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDueDiligenceItemStatusRequest extends FormRequest {
    public function authorize(): bool {
        return $this->user() !== null;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array {
        return [
            'status' => [
                'required',
                'string',
                Rule::in(DueDiligenceItemStatus::values()),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array {
        return [
            'status.required' => 'Seleziona uno stato.',
            'status.in' => 'Lo stato selezionato non è valido.',
        ];
    }
}
