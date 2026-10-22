<?php

namespace App\Http\Controllers;

use App\Http\Requests\PlanRequest;
use App\Http\Resources\PlanResource;
use App\Models\MembershipPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $plans = MembershipPlan::withCount('memberships')
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->query('search')}%");
            })
            ->when($request->filled('status') && $request->query('status') !== 'all', function ($q) use ($request) {
                $q->where('status', $request->query('status'));
            })
            ->when($request->filled('type') && $request->query('type') !== 'all', function ($q) use ($request) {
                $q->where('type', $request->query('type'));
            })
            ->orderByDesc('created_at')
            ->paginate(min((int) $request->query('per_page', 10), 100));

        return response()->json([
            'data' => PlanResource::collection($plans->items()),
            'meta' => [
                'current_page' => $plans->currentPage(),
                'last_page' => $plans->lastPage(),
                'per_page' => $plans->perPage(),
                'total' => $plans->total(),
            ],
        ]);
    }

    public function store(PlanRequest $request): JsonResponse
    {
        $plan = MembershipPlan::create($request->validated());

        return response()->json([
            'message' => 'Plan created successfully.',
            'data' => new PlanResource($plan),
        ], 201);
    }

    public function show(MembershipPlan $plan): JsonResponse
    {
        $plan->loadCount('memberships');

        return response()->json(['data' => new PlanResource($plan)]);
    }

    public function update(PlanRequest $request, MembershipPlan $plan): JsonResponse
    {
        $plan->update($request->validated());

        return response()->json([
            'message' => 'Plan updated successfully.',
            'data' => new PlanResource($plan),
        ]);
    }

    public function destroy(MembershipPlan $plan): JsonResponse
    {
        if ($plan->memberships()->where('status', 'active')->exists()) {
            $plan->update(['status' => 'archived']);

            return response()->json([
                'message' => 'Plan has active members and was archived instead of deleted.',
                'data' => new PlanResource($plan),
            ]);
        }

        $plan->delete();

        return response()->json(['message' => 'Plan deleted successfully.']);
    }
}
