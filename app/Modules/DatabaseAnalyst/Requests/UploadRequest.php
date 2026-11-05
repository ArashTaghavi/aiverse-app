<?php

namespace App\Modules\DatabaseAnalyst\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UploadRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => [
                'required',
                'string',
                'max:100',
            ],
            'file' => [
                'required',
                'file',
                'max:4096',
                'mimetypes:text/plain,application/sql,application/x-sql,text/x-sql',
            ],
        ];
    }
}
