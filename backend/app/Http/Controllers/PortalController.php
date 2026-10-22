<?php

namespace App\Http\Controllers;

use App\Http\Resources\AttendanceResource;
use App\Http\Resources\MemberResource;
use App\Http\Resources\MembershipResource;
use App\Http\Resources\PaymentResource;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortalController extends Controller
{
    private function resolveMember(Request $request): Member
    {
        $user = $request->user();

        $member = $user->member()->first()
            ?? Member::where('email', $user->email)->first();

        if (! $member) {
            $member = Member::create([
                'user_id' => $user->id,
                'member_code' => Member::generateCode(),
                'first_name' => $user->name,
                'last_name' => '',
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => 'pending',
            ]);
        } elseif (! $member->user_id) {
            $member->update(['user_id' => $user->id]);
        }

        return $member;
    }

    public function profile(Request $request): JsonResponse
    {
        $member = $this->resolveMember($request)
            ->load(['currentMembership.plan', 'latestMembership.plan']);

        return response()->json([
            'data' => new MemberResource($member),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $member = $this->resolveMember($request);

        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:500'],
            'gender' => ['nullable', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:30'],
        ]);

        $member->update($data);

        $user->update([
            'name' => trim($data['first_name'] . ' ' . $data['last_name']),
            'phone' => $data['phone'] ?? $user->phone,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'data' => new MemberResource($member->fresh()->load(['currentMembership.plan', 'latestMembership.plan'])),
        ]);
    }

    public function memberships(Request $request): JsonResponse
    {
        $memberships = $this->resolveMember($request)->memberships()
            ->with('plan')
            ->orderByDesc('start_date')
            ->get();

        return response()->json([
            'data' => MembershipResource::collection($memberships),
        ]);
    }

    public function payments(Request $request): JsonResponse
    {
        $payments = $this->resolveMember($request)->payments()
            ->with('plan')
            ->orderByDesc('created_at')
            ->paginate(min((int) $request->query('per_page', 15), 50));

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

    public function attendance(Request $request): JsonResponse
    {
        $records = $this->resolveMember($request)->attendanceRecords()
            ->when($request->filled('date'), fn ($q) => $q->where('date', $request->query('date')))
            ->orderByDesc('date')
            ->paginate(min((int) $request->query('per_page', 15), 50));

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
