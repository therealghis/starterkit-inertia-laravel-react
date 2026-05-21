<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreDueDiligenceItemAttachmentRequest extends FormRequest {
    public function authorize(): bool {
        return $this->user() !== null;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array {
        return [
            'attachments' => ['required', 'array', 'min:1'],
            'attachments.*' => [
                'required',
                'file',
                'mimes:pdf,jpeg,jpg,png,webp,doc,docx,xls,xlsx,ppt,pptx,txt,csv,zip,rar,7z,p7m,xml',
                'max:51200',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array {
        return [
            'attachments.required' => 'Carica almeno un allegato.',
            'attachments.array' => 'Gli allegati inviati non sono validi.',
            'attachments.*.file' => 'Ogni allegato deve essere un file valido.',
            'attachments.*.mimes' => 'Il formato del file allegato non è supportato.',
            'attachments.*.max' => 'Ogni allegato non può superare 50 MB.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array {
        return [
            'attachments' => 'allegati',
            'attachments.*' => 'allegato',
        ];
    }
}
