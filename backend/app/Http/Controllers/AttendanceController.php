<?php

namespace App\Http\Controllers;

use App\Http\Resources\AttendanceResource;
use App\Models\AttendanceRecord;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $records = AttendanceRecord::with('member')
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->query('search');
                $q->whereHas('member', fn ($m) => $m->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('member_code', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%"));
            })
            ->when($request->filled('date'), fn ($q) => $q->whereDate('date', $request->query('date')))
            ->when($request->filled('from'), fn ($q) => $q->whereDate('date', '>=', $request->query('from')))
            ->when($request->filled('to'), fn ($q) => $q->whereDate('date', '<=', $request->query('to')))
            ->when($request->filled('status') && $request->query('status') !== 'all', fn ($q) => $q->where('status', $request->query('status')))
            ->when($request->filled('member_id'), fn ($q) => $q->where('member_id', $request->query('member_id')))
            ->orderByDesc('date')
            ->orderByDesc('check_in')
            ->paginate(min((int) $request->query('per_page', 10), 100));

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

    public function checkIn(Request $request): JsonResponse
    {
        $request->validate(['member_id' => ['required', 'exists:members,id']]);

        $member = Member::findOrFail($request->member_id);
        $today = now()->toDateString();

        $existing = AttendanceRecord::where('member_id', $member->id)
            ->whereDate('date', $today)
            ->first();

        if ($existing && $existing->check_in && ! $existing->check_out) {
            return response()->json(['message' => 'Member is already checked in today.'], 422);
        }

        if ($existing) {
            return response()->json(['message' => 'Member already has an attendance record for today.'], 422);
        }

        $record = AttendanceRecord::create([
            'member_id' => $member->id,
            'date' => $today,
            'check_in' => now(),
            'status' => now()->hour >= 10 ? 'late' : 'present',
        ]);

        return response()->json([
            'message' => "{$member->full_name} checked in successfully.",
            'data' => new AttendanceResource($record->load('member')),
        ], 201);
    }

    public function checkOut(Request $request): JsonResponse
    {
        $request->validate(['member_id' => ['required', 'exists:members,id']]);

        $record = AttendanceRecord::where('member_id', $request->member_id)
            ->whereDate('date', now()->toDateString())
            ->whereNotNull('check_in')
            ->whereNull('check_out')
            ->first();

        if (! $record) {
            return response()->json(['message' => 'No active check-in found for this member today.'], 422);
        }

        $record->update(['check_out' => now()]);

        return response()->json([
            'message' => 'Checked out successfully.',
            'data' => new AttendanceResource($record->fresh()->load('member')),
        ]);
    }

    public function memberAttendance(Request $request, Member $member): JsonResponse
    {
        $records = $member->attendanceRecords()
            ->when($request->filled('from'), fn ($q) => $q->where('date', '>=', $request->query('from')))
            ->when($request->filled('to'), fn ($q) => $q->whereDate('date', '<=', $request->query('to')))
            ->latest('date')
            ->paginate(min((int) $request->query('per_page', 10), 100));

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
