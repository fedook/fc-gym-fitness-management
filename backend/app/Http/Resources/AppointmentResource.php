<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'member_id' => $this->member_id,
            'member' => new MemberResource($this->whenLoaded('member')),
            'trainer_id' => $this->trainer_id,
            'trainer' => new TrainerResource($this->whenLoaded('trainer')),
            'title' => $this->title,
            'type' => $this->type,
            'scheduled_at' => $this->scheduled_at?->toIso8601String(),
            'duration_minutes' => $this->duration_minutes,
            'status' => $this->status,
            'notes' => $this->notes,
        ];
    }
}
