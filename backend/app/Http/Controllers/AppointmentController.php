<?php

namespace App\Http\Controllers;

use App\Http\Requests\AppointmentRequest;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $appointments = Appointment::with(['member', 'trainer'])
            ->when($request->filled('status') && $request->query('status') !== 'all', fn ($q) => $q->where('status', $request->query('status')))
            ->when($request->filled('from'), fn ($q) => $q->where('scheduled_at', '>=', $request->query('from')))
            ->when($request->filled('to'), fn ($q) => $q->where('scheduled_at', '<=', $request->query('to') . ' 23:59:59'))
            ->when($request->filled('member_id'), fn ($q) => $q->where('member_id', $request->query('member_id')))
            ->when($request->filled('trainer_id'), fn ($q) => $q->where('trainer_id', $request->query('trainer_id')))
            ->orderBy('scheduled_at')
            ->paginate(min((int) $request->query('per_page', 10), 100));

        return response()->json([
            'data' => AppointmentResource::collection($appointments->items()),
            'meta' => [
                'current_page' => $appointments->currentPage(),
                'last_page' => $appointments->lastPage(),
                'per_page' => $appointments->perPage(),
                'total' => $appointments->total(),
            ],
        ]);
    }

    public function store(AppointmentRequest $request): JsonResponse
    {
        $appointment = Appointment::create($request->validated());

        return response()->json([
            'message' => 'Appointment scheduled successfully.',
            'data' => new AppointmentResource($appointment->load(['member', 'trainer'])),
        ], 201);
    }

    public function show(Appointment $appointment): JsonResponse
    {
        return response()->json([
            'data' => new AppointmentResource($appointment->load(['member', 'trainer'])),
        ]);
    }

    public function update(AppointmentRequest $request, Appointment $appointment): JsonResponse
    {
        $appointment->update($request->validated());

        return response()->json([
            'message' => 'Appointment updated successfully.',
            'data' => new AppointmentResource($appointment->fresh()->load(['member', 'trainer'])),
        ]);
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        $appointment->delete();

        return response()->json(['message' => 'Appointment deleted successfully.']);
    }
}
