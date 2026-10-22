<?php

namespace App\Http\Controllers;

use App\Http\Requests\MemberRequest;
use App\Http\Resources\AttendanceResource;
use App\Http\Resources\MemberResource;
use App\Http\Resources\MembershipResource;
use App\Http\Resources\PaymentResource;
use App\Models\Member;
use App\Models\Membership;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MemberController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Member::with(['latestMembership.plan', 'currentMembership.plan'])
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->query('search');
                $q->where(function ($sub) use ($search) {
                    $sub->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('member_code', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status') && $request->query('status') !== 'all', function ($q) use ($request) {
                $q->where('status', $request->query('status'));
            })
            ->when($request->filled('plan') && $request->query('plan') !== 'all', function ($q) use ($request) {
                $q->whereHas('memberships', function ($sub) use ($request) {
                    $sub->where('membership_plan_id', $request->query('plan'))
                        ->where('status', 'active');
                });
            });

        $sort = $request->query('sort', 'newest');

        match ($sort) {
            'name_asc' => $query->orderBy('first_name')->orderBy('last_name'),
            'name_desc' => $query->orderByDesc('first_name')->orderByDesc('last_name'),
            'oldest' => $query->orderBy('created_at'),
            'expiration' => $query->orderByRaw(
                "COALESCE((SELECT MAX(end_date) FROM memberships WHERE memberships.member_id = members.id AND memberships.status = 'active'), '1970-01-01') DESC"
            ),
            default => $query->orderByDesc('created_at'),
        };

        $perPage = min((int) $request->query('per_page', 10), 100);
        $members = $query->paginate($perPage);

        return response()->json([
            'data' => MemberResource::collection($members->items()),
            'meta' => [
                'current_page' => $members->currentPage(),
                'last_page' => $members->lastPage(),
                'per_page' => $members->perPage(),
                'total' => $members->total(),
            ],
        ]);
    }

    public function store(MemberRequest $request): JsonResponse
    {
        $member = DB::transaction(function () use ($request) {
            $member = Member::create($request->safe()->except(['plan_id', 'membership_start_date', 'membership_end_date']) + [
                'member_code' => Member::generateCode(),
                'status' => $request->input('status', 'pending'),
            ]);

            if ($request->filled('plan_id')) {
                $plan = \App\Models\MembershipPlan::findOrFail($request->plan_id);
                $start = $request->input('membership_start_date');
                $end = $request->input('membership_end_date') ?? now()->addDays($plan->duration_days)->toDateString();

                $membership = Membership::create([
                    'member_id' => $member->id,
                    'membership_plan_id' => $plan->id,
                    'start_date' => $start,
                    'end_date' => $end,
                    'amount' => $plan->price,
                    'status' => 'active',
                    'created_by' => $request->user()->id,
                ]);

                $member->update(['status' => 'active']);
                $member->setRelation('currentMembership', $membership->setRelation('plan', $plan));
            }

            return $member;
        });

        return response()->json([
            'message' => 'Member created successfully.',
            'data' => new MemberResource($member->load(['latestMembership.plan', 'currentMembership.plan'])),
        ], 201);
    }

    public function show(Member $member): JsonResponse
    {
        $member->load([
            'latestMembership.plan',
            'currentMembership.plan',
            'memberships.plan',
        ]);

        return response()->json(['data' => new MemberResource($member)]);
    }

    public function update(MemberRequest $request, Member $member): JsonResponse
    {
        $member->update($request->safe()->except(['plan_id', 'membership_start_date', 'membership_end_date']));

        if ($request->filled('plan_id') && $request->filled('membership_start_date')) {
            DB::transaction(function () use ($request, $member) {
                $member->memberships()->where('status', 'active')->update(['status' => 'cancelled']);
                $plan = \App\Models\MembershipPlan::findOrFail($request->plan_id);

                Membership::create([
                    'member_id' => $member->id,
                    'membership_plan_id' => $plan->id,
                    'start_date' => $request->membership_start_date,
                    'end_date' => $request->membership_end_date ?? now()->addDays($plan->duration_days)->toDateString(),
                    'amount' => $plan->price,
                    'status' => 'active',
                    'created_by' => $request->user()->id,
                ]);

                $member->update(['status' => 'active']);
            });
        }

        return response()->json([
            'message' => 'Member updated successfully.',
            'data' => new MemberResource($member->fresh()->load(['latestMembership.plan', 'currentMembership.plan'])),
        ]);
    }

    public function updateStatus(Request $request, Member $member): JsonResponse
    {
        $request->validate(['status' => ['required', 'in:active,pending,expired,suspended']]);
        $member->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Member status updated.',
            'data' => new MemberResource($member),
        ]);
    }

    public function destroy(Member $member): JsonResponse
    {
        if ($member->memberships()->where('status', 'active')->exists()) {
            return response()->json([
                'message' => 'Cannot delete a member with an active membership. Cancel or expire the membership first.',
            ], 422);
        }

        DB::transaction(fn () => $member->delete());

        return response()->json(['message' => 'Member deleted successfully.']);
    }

    public function memberships(Member $member): JsonResponse
    {
        $memberships = $member->memberships()->with('plan')->latest()->get();

        return response()->json(MembershipResource::collection($memberships));
    }

    public function payments(Member $member): JsonResponse
    {
        $payments = $member->payments()->with('plan')->latest()->paginate(10);

        return response()->json([
            'data' => PaymentResource::collection($payments->items()),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ],
        ]);
    }

    public function attendance(Request $request, Member $member): JsonResponse
    {
        $records = $member->attendanceRecords()
            ->when($request->filled('from'), fn ($q) => $q->where('date', '>=', $request->query('from')))
            ->when($request->filled('to'), fn ($q) => $q->where('date', '<=', $request->query('to')))
            ->latest('date')
            ->paginate(10);

        return response()->json([
            'data' => AttendanceResource::collection($records->items()),
            'meta' => [
                'current_page' => $records->currentPage(),
                'last_page' => $records->lastPage(),
                'per_page' => $records->perPage(),
                'total' => $records->total(),
            ],
        ]);
    }
}
