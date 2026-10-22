<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'member_code' => $this->member_code,
            'user_id' => $this->user_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'gender' => $this->gender,
            'emergency_contact_name' => $this->emergency_contact_name,
            'emergency_contact_phone' => $this->emergency_contact_phone,
            'photo' => $this->photo,
            'status' => $this->status,
            'current_membership' => $this->whenLoaded('currentMembership', function () {
                $current = $this->currentMembership;

                return [
                    'id' => $current->id,
                    'plan' => new PlanResource($current->plan),
                    'start_date' => $current->start_date?->toDateString(),
                    'end_date' => $current->end_date?->toDateString(),
                    'status' => $current->status,
                    'amount' => $current->amount,
                ];
            }),
            'latest_membership' => $this->whenLoaded('latestMembership', function () {
                $latest = $this->latestMembership;

                return [
                    'id' => $latest->id,
                    'plan_name' => $latest->plan?->name,
                    'start_date' => $latest->start_date?->toDateString(),
                    'end_date' => $latest->end_date?->toDateString(),
                    'status' => $latest->status,
                ];
            }),
            'created_at' => $this->created_at?->toDateString(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
