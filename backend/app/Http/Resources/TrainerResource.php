<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrainerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'specialization' => $this->specialization,
            'availability' => $this->availability,
            'bio' => $this->bio,
            'photo' => $this->photo,
            'status' => $this->status,
            'appointments_count' => $this->whenCounted('appointments'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
