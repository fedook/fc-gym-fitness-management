<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'type' => $this->type,
            'duration_days' => $this->duration_days,
            'price' => $this->price,
            'benefits' => $this->benefits ?? [],
            'status' => $this->status,
            'members_count' => $this->whenCounted('memberships'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
