<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payment_number' => $this->payment_number,
            'member_id' => $this->member_id,
            'member' => new MemberResource($this->whenLoaded('member')),
            'plan' => new PlanResource($this->whenLoaded('plan')),
            'membership_id' => $this->membership_id,
            'amount' => $this->amount,
            'payment_method' => $this->payment_method,
            'status' => $this->status,
            'reference_number' => $this->reference_number,
            'notes' => $this->notes,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'recorded_by' => $this->recorded_by,
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
