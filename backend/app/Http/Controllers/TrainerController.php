<?php

namespace App\Http\Controllers;

use App\Http\Requests\TrainerRequest;
use App\Http\Resources\TrainerResource;
use App\Models\Trainer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $trainers = Trainer::withCount('appointments')
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->query('search');
                $q->where(function ($sub) use ($search) {
                    $sub->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('specialization', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status') && $request->query('status') !== 'all', fn ($q) => $q->where('status', $request->query('status')))
            ->latest()
            ->paginate(min((int) $request->query('per_page', 10), 100));

        return response()->json([
            'data' => TrainerResource::collection($trainers->items()),
            'meta' => [
                'current_page' => $trainers->currentPage(),
                'last_page' => $trainers->lastPage(),
                'per_page' => $trainers->perPage(),
                'total' => $trainers->total(),
            ],
        ]);
    }

    public function store(TrainerRequest $request): JsonResponse
    {
        $trainer = Trainer::create($request->validated());

        return response()->json([
            'message' => 'Trainer created successfully.',
            'data' => new TrainerResource($trainer),
        ], 201);
    }

    public function show(Trainer $trainer): JsonResponse
    {
        $trainer->loadCount('appointments');

        return response()->json(['data' => new TrainerResource($trainer)]);
    }

    public function update(TrainerRequest $request, Trainer $trainer): JsonResponse
    {
        $trainer->update($request->validated());

        return response()->json([
            'message' => 'Trainer updated successfully.',
            'data' => new TrainerResource($trainer),
        ]);
    }

    public function destroy(Trainer $trainer): JsonResponse
    {
        if ($trainer->appointments()->where('status', 'scheduled')->exists()) {
            $trainer->update(['status' => 'inactive']);

            return response()->json([
                'message' => 'Trainer has upcoming appointments and was deactivated instead of deleted.',
                'data' => new TrainerResource($trainer),
            ]);
        }

        $trainer->delete();

        return response()->json(['message' => 'Trainer deleted successfully.']);
    }
}
