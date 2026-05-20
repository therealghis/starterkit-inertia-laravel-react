<?php

namespace App\Http\Requests;

use App\Enums\MergeAcquisitionType;
use App\Models\MergeAcquisition;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MergeAcquisitionEditRequest extends FormRequest {
    public function authorize(): bool {
        return $this->user()?->id === $this->mergeAcquisition?->user_id;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array {
        /** @var MergeAcquisition $mergeAcquisition */
        $mergeAcquisition = $this->route('mergeAcquisition');

        return [
            'merge_acquisition_economic_activity_id' => [
                'required',
                'integer',
                Rule::exists('merge_acquisition_economic_activity', 'id')->where('active', true),
            ],
            'identification_code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('merge_acquisition', 'identification_code')->ignore($mergeAcquisition),
            ],
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
            'attachments' => ['nullable', 'array'],
            'attachments.*' => [
                'nullable',
                'file',
                'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,zip,rar,7z',
                'max:2048',
            ],
            'financials' => ['nullable', 'array'],
            'financials.*.id' => [
                'nullable',
                'integer',
                Rule::exists('merge_acquisition_financial', 'id')
                    ->where('merge_acquisition_id', $mergeAcquisition->id),
            ],
            'financials.*.year' => ['required', 'integer', 'digits:4', 'distinct'],
            'financials.*.sales' => ['required', 'string', 'max:255'],
            'financials.*.income' => ['required', 'string', 'max:255'],
            'financials.*.pfn' => ['required', 'string', 'max:255'],
            'financials.*.ebitda' => ['required', 'string', 'max:255'],
            'financials.*.debt' => ['nullable', 'string', 'max:255'],
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
            'attachments.*.mimes' => 'Gli allegati devono essere in un formato supportato.',
            'attachments.*.max' => 'Ogni allegato non può superare 2 MB.',
            'financials.*.year.digits' => "L'anno dei dati finanziari deve contenere 4 cifre.",
            'financials.*.year.distinct' => 'Non puoi inviare due righe finanziarie con lo stesso anno.',
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
            'attachments' => 'allegati',
            'attachments.*' => 'allegato',
            'financials' => 'dati finanziari',
            'financials.*.id' => 'riga finanziaria',
            'financials.*.year' => 'anno finanziario',
            'financials.*.sales' => 'sales',
            'financials.*.income' => 'income',
            'financials.*.pfn' => 'PFN',
            'financials.*.ebitda' => 'EBITDA',
            'financials.*.debt' => 'debt',
        ];
    }
}
