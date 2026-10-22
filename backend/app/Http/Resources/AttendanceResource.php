<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'member_id' => $this->member_id,
            'member' => new MemberResource($this->whenLoaded('member')),
            'date' => $this->date?->toDateString(),
            'check_in' => $this->check_in?->toDateTimeString(),
            'check_out' => $this->check_out?->toDateTimeString(),
            'status' => $this->status,
            'notes' => $this->notes,
            'duration_minutes' => $this->when(
                $this->check_in && $this->check_out,
                fn () => (int) $this->check_in->diffInMinutes($this->check_out)
            ),
        ];
    }
}
