<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class ReportController extends Controller
{
    public function members(Request $request): JsonResponse
    {
        [$from, $to] = $this->dateRange($request);

        $query = Member::query();

        if ($from && $to) {
            $query->whereBetween('created_at', [$from, $to]);
        }

        $statusCounts = $query->clone()->groupBy('status')->selectRaw('status, COUNT(*) as count')->pluck('count', 'status');
        $total = $query->clone()->count();

        $rows = $query->clone()
            ->with('latestMembership.plan')
            ->orderBy('created_at', 'desc')
            ->limit(200)
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'member_code' => $m->member_code,
                'name' => $m->full_name,
                'email' => $m->email,
                'phone' => $m->phone,
                'status' => $m->status,
                'plan' => $m->latestMembership?->plan?->name,
                'joined' => $m->created_at?->toDateString(),
            ]);

        $planDistribution = MembershipPlan::withCount(['memberships as active_memberships_count' => fn ($q) => $q->where('status', 'active')])
            ->get()
            ->map(fn ($p) => [
                'plan' => $p->name,
                'type' => $p->type,
                'count' => (int) $p->active_memberships_count,
            ]);

        return response()->json([
            'summary' => [
                'total' => $total,
                'active' => (int) ($statusCounts['active'] ?? 0),
                'pending' => (int) ($statusCounts['pending'] ?? 0),
                'expired' => (int) ($statusCounts['expired'] ?? 0),
                'suspended' => (int) ($statusCounts['suspended'] ?? 0),
            ],
            'plan_distribution' => $planDistribution,
            'rows' => $rows,
        ]);
    }

    public function payments(Request $request): JsonResponse
    {
        [$from, $to] = $this->dateRange($request);

        $query = Payment::with(['member', 'plan']);

        if ($from && $to) {
            $query->whereBetween('created_at', [$from, $to]);
        }

        $statusCounts = Payment::query()
            ->when($from, fn ($q) => $q->whereBetween('created_at', [$from, $to]))
            ->groupBy('status')->selectRaw('status, COUNT(*) as count')->pluck('count', 'status');

        $totalRevenue = (float) Payment::query()
            ->where('status', 'paid')
            ->when($from, fn ($q) => $q->whereBetween('paid_at', [$from, $to]))
            ->sum('amount');

        $driver = DB::getDriverName();
        $monthExpr = $driver === 'sqlite' ? "strftime('%Y-%m', paid_at)" : "DATE_FORMAT(paid_at, '%Y-%m')";

        $monthly = Payment::query()
            ->where('status', 'paid')
            ->whereNotNull('paid_at')
            ->where('paid_at', '>=', Carbon::now()->subMonthsNoOverflow(11)->startOfMonth())
            ->selectRaw("{$monthExpr} as month, SUM(amount) as total, COUNT(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $rows = $query->latest()->limit(200)->get()->map(fn ($p) => [
            'id' => $p->id,
            'payment_number' => $p->payment_number,
            'member' => $p->member?->full_name,
            'plan' => $p->plan?->name,
            'amount' => (float) $p->amount,
            'method' => $p->payment_method,
            'status' => $p->status,
            'date' => ($p->paid_at ?? $p->created_at)?->toDateString(),
        ]);

        return response()->json([
            'summary' => [
                'total_revenue' => $totalRevenue,
                'paid_count' => (int) ($statusCounts['paid'] ?? 0),
                'pending_count' => (int) ($statusCounts['pending'] ?? 0),
                'failed_count' => (int) ($statusCounts['failed'] ?? 0),
                'refunded_count' => (int) ($statusCounts['refunded'] ?? 0),
            ],
            'monthly' => $monthly->map(fn ($r) => [
                'month' => $r->month,
                'total' => (float) $r->total,
                'count' => (int) $r->count,
            ]),
            'rows' => $rows,
        ]);
    }

    public function attendance(Request $request): JsonResponse
    {
        [$from, $to] = $this->dateRange($request);

        $query = AttendanceRecord::with('member');

        if ($from && $to) {
            $query->whereBetween('date', [$from->toDateString(), $to->toDateString()]);
        }

        $daily = AttendanceRecord::query()
            ->when($from, fn ($q) => $q->whereBetween('date', [$from->toDateString(), $to->toDateString()]))
            ->selectRaw("date, COUNT(*) as count, SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count")
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $totalCheckIns = (int) $daily->sum('count');
        $uniqueMembers = $query->clone()->distinct()->count('member_id');

        $rows = $query->clone()->latest('date')->limit(200)->get()->map(fn ($a) => [
            'id' => $a->id,
            'member' => $a->member?->full_name,
            'member_code' => $a->member?->member_code,
            'date' => $a->date?->toDateString(),
            'check_in' => $a->check_in?->format('H:i'),
            'check_out' => $a->check_out?->format('H:i'),
            'status' => $a->status,
        ]);

        return response()->json([
            'summary' => [
                'total_check_ins' => $totalCheckIns,
                'unique_members' => $uniqueMembers,
                'avg_per_day' => $daily->count() ? round($totalCheckIns / $daily->count(), 1) : 0,
            ],
            'daily' => $daily->map(fn ($d) => [
                'date' => $d->date,
                'count' => (int) $d->count,
                'late_count' => (int) $d->late_count,
            ]),
            'rows' => $rows,
        ]);
    }

    private function dateRange(Request $request): array
    {
        $from = $request->query('from');
        $to = $request->query('to');

        return [
            $from ? Carbon::parse($from)->startOfDay() : null,
            $to ? Carbon::parse($to)->endOfDay() : null,
        ];
    }
}
