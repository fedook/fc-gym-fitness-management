<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isManagement() ?? false;
    }

    public function rules(): array
    {
        return [
            'member_id' => ['required', 'exists:members,id'],
            'membership_plan_id' => ['nullable', 'exists:membership_plans,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['required', 'in:cash,card,bank_transfer,e_wallet'],
            'status' => ['sometimes', 'in:pending,paid,failed,refunded'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'paid_at' => ['nullable', 'date'],
            'create_membership' => ['sometimes', 'boolean'],
            'membership_start_date' => ['nullable', 'date', 'required_if:create_membership,true'],
            'membership_end_date' => ['nullable', 'date', 'after_or_equal:membership_start_date'],
        ];
    }
}
