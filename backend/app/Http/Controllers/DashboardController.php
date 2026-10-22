<?php

namespace App\Http\Controllers;

use App\Http\Resources\AppointmentResource;
use App\Http\Resources\MemberResource;
use App\Models\Appointment;
use App\Models\AttendanceRecord;
use App\Models\Member;
use App\Models\Membership;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $now = Carbon::now();
        $totalMembers = Member::count();
        $prevMonthMembers = Member::whereBetween('created_at', [
            $now->copy()->subMonthsNoOverflow(1)->startOfMonth(),
            $now->copy()->subMonthsNoOverflow(1)->endOfMonth(),
        ])->count();
        $thisMonthMembers = Member::whereBetween('created_at', [
            $now->copy()->startOfMonth(),
            $now->copy()->endOfMonth(),
        ])->count();
        $memberChange = $this->pctChange($prevMonthMembers, $thisMonthMembers);

        $todayCheckIns = AttendanceRecord::whereDate('date', $now->toDateString())->count();
        $lastWeekCheckIns = AttendanceRecord::whereDate('date', $now->copy()->subWeek()->toDateString())->count();
        $checkInChange = $this->pctChange($lastWeekCheckIns, $todayCheckIns);

        $monthRevenue = (float) Payment::where('status', 'paid')
            ->whereBetween('paid_at', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])
            ->sum('amount');
        $prevMonthRevenue = (float) Payment::where('status', 'paid')
            ->whereBetween('paid_at', [
                $now->copy()->subMonthsNoOverflow(1)->startOfMonth(),
                $now->copy()->subMonthsNoOverflow(1)->endOfMonth(),
            ])->sum('amount');
        $revenueChange = $this->pctChange($prevMonthRevenue, $monthRevenue);

        $expiringSoon = Membership::where('status', 'active')
            ->whereBetween('end_date', [$now->toDateString(), $now->copy()->addDays(30)->toDateString()])
            ->count();

        return response()->json([
            'total_members' => $totalMembers,
            'total_members_change' => $memberChange,
            'today_check_ins' => $todayCheckIns,
            'today_check_ins_change' => $checkInChange,
            'monthly_revenue' => $monthRevenue,
            'monthly_revenue_change' => $revenueChange,
            'expiring_soon' => $expiringSoon,
        ]);
    }

    public function revenue(Request $request): JsonResponse
    {
        $range = $request->query('range', '6m');
        $now = Carbon::now();

        [$start, $groupFormat] = match ($range) {
            '12m' => [$now->copy()->subMonthsNoOverflow(11)->startOfMonth(), 'Y-m'],
            'year' => [$now->copy()->startOfYear(), 'Y-m'],
            default => [$now->copy()->subMonthsNoOverflow(5)->startOfMonth(), 'Y-m'],
        };

        $driver = DB::getDriverName();
        $monthExpr = $driver === 'sqlite' ? "strftime('%Y-%m', paid_at)" : "DATE_FORMAT(paid_at, '%Y-%m')";

        $rows = Payment::query()
            ->where('status', 'paid')
            ->whereNotNull('paid_at')
            ->where('paid_at', '>=', $start)
            ->selectRaw("{$monthExpr} as month, SUM(amount) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $data = [];
        $cursor = $start->copy();
        $end = $now->copy()->endOfMonth();

        while ($cursor->lte($end)) {
            $key = $cursor->format($groupFormat);
            $data[] = [
                'month' => $key,
                'label' => $cursor->format('M Y'),
                'total' => (float) ($rows[$key]->total ?? 0),
            ];
            $cursor->addMonthNoOverflow();
        }

        return response()->json(['data' => $data]);
    }

    public function recentMembers(): JsonResponse
    {
        $members = Member::with(['latestMembership.plan'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json(MemberResource::collection($members));
    }

    public function upcomingAppointments(): JsonResponse
    {
        $appointments = Appointment::with(['member', 'trainer'])
            ->where('scheduled_at', '>=', now())
            ->where('status', 'scheduled')
            ->orderBy('scheduled_at')
            ->take(5)
            ->get();

        return response()->json(AppointmentResource::collection($appointments));
    }

    public function expiringMemberships(): JsonResponse
    {
        $memberships = Membership::with(['member', 'plan'])
            ->where('status', 'active')
            ->whereBetween('end_date', [now()->toDateString(), now()->addDays(30)->toDateString()])
            ->orderBy('end_date')
            ->get();

        return response()->json($memberships->map(fn ($m) => [
            'id' => $m->id,
            'member_id' => $m->member_id,
            'member_name' => $m->member?->full_name,
            'member_code' => $m->member?->member_code,
            'plan_name' => $m->plan?->name,
            'end_date' => $m->end_date?->toDateString(),
            'days_left' => now()->startOfDay()->diffInDays($m->end_date->startOfDay(), false),
        ]));
    }

    private function pctChange(?float $previous, ?float $current): ?float
    {
        if ($previous === null || $current === null) {
            return null;
        }

        if ((float) $previous == 0.0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
