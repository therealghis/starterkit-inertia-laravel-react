<?php

namespace App\Http\Requests;

use App\Enums\MergeAcquisitionType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MergeAcquisitionRequest extends FormRequest {
    public function authorize(): bool {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array {
        return [
            'merge_acquisition_economic_activity_id' => [
                'required',
                'integer',
                Rule::exists('merge_acquisition_economic_activity', 'id')->where('active', true),
            ],
            'identification_code' => ['required', 'string', 'max:255', 'unique:merge_acquisition,identification_code'],
            'intent_type' => ['required', 'string', Rule::in([
                MergeAcquisitionType::BUY_SIDE,
                MergeAcquisitionType::SELL_SIDE,
            ])],
            'company_name' => ['required', 'string', 'max:255'],
            'company_description' => ['required', 'string'],
            'product' => ['required', 'string'],
            'legal_entity' => ['nullable', 'string', 'max:255'],
            'establishment_date' => ['nullable', 'digits:4'],
            'ateco_code' => ['nullable', 'string', 'max:255'],
            'nominal_capital' => ['nullable', 'string', 'max:255'],
            'headquarters_legal_province' => ['nullable', 'string', 'max:255'],
            'headquarters_legal_country' => ['nullable', 'string', 'max:255'],
            'headquarters_operative_province' => ['nullable', 'string', 'max:255'],
            'headquarters_operative_country' => ['nullable', 'string', 'max:255'],
            'total_employees' => ['nullable', 'integer', 'min:0'],
            'selling_type' => ['nullable', 'string', 'max:255'],
            'selling_reason' => ['nullable', 'string'],
            'real_estate' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array {
        return [
            'merge_acquisition_economic_activity_id.exists' => 'Il settore attività selezionato non è disponibile.',
            'intent_type.in' => 'Il tipo operazione selezionato non è valido.',
            'establishment_date.digits' => "L'anno costituzione deve contenere 4 cifre.",
            'total_employees.min' => 'Il numero dipendenti non può essere negativo.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array {
        return [
            'merge_acquisition_economic_activity_id' => 'settore attività',
            'identification_code' => 'codice opportunità',
            'intent_type' => 'tipo operazione',
            'company_name' => 'nome azienda',
            'company_description' => 'descrizione azienda',
            'product' => 'prodotto',
            'legal_entity' => 'forma giuridica',
            'establishment_date' => 'anno costituzione',
            'ateco_code' => 'codice Ateco',
            'nominal_capital' => 'capitale nominale',
            'headquarters_legal_province' => 'sede legale provincia',
            'headquarters_legal_country' => 'sede legale paese',
            'headquarters_operative_province' => 'sede operativa provincia',
            'headquarters_operative_country' => 'sede operativa paese',
            'total_employees' => 'numero dipendenti',
            'selling_type' => 'tipologia cessione',
            'selling_reason' => 'motivo cessione',
            'real_estate' => 'componente immobiliare',
        ];
    }
}
