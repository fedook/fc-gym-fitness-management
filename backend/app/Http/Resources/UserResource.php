<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'is_active' => $this->is_active,
            'member' => new MemberResource($this->whenLoaded('member')),
            'trainer' => new TrainerResource($this->whenLoaded('trainer')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
