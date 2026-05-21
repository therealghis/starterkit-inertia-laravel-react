<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class MergeAcquisitionContactRequestStoreRequest extends FormRequest {
    public function authorize(): bool {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array {
        return [
            'requester_name' => ['required', 'string', 'max:255'],
            'requester_surname' => ['required', 'string', 'max:255'],
            'requester_phone' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array {
        return [
            'requester_name' => 'nome',
            'requester_surname' => 'cognome',
            'requester_phone' => 'numero di telefono',
        ];
    }
}
