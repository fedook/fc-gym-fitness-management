<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $payments = Payment::with(['member', 'plan'])
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->query('search');
                $q->where(function ($sub) use ($search) {
                    $sub->where('payment_number', 'like', "%{$search}%")
                        ->orWhere('reference_number', 'like', "%{$search}%")
                        ->orWhereHas('member', fn ($m) => $m->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"));
                });
            })
            ->when($request->filled('status') && $request->query('status') !== 'all', fn ($q) => $q->where('status', $request->query('status')))
            ->when($request->filled('method') && $request->query('method') !== 'all', fn ($q) => $q->where('payment_method', $request->query('method')))
            ->when($request->filled('from'), fn ($q) => $q->whereDate('created_at', '>=', $request->query('from')))
            ->when($request->filled('to'), fn ($q) => $q->whereDate('created_at', '<=', $request->query('to')))
            ->when($request->filled('member_id'), fn ($q) => $q->where('member_id', $request->query('member_id')))
            ->latest()
            ->paginate(min((int) $request->query('per_page', 10), 100));

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

    public function store(PaymentRequest $request): JsonResponse
    {
        $payment = DB::transaction(function () use ($request) {
            $payment = Payment::create([
                'payment_number' => $this->generatePaymentNumber(),
                'member_id' => $request->member_id,
                'membership_plan_id' => $request->membership_plan_id,
                'amount' => $request->amount,
                'payment_method' => $request->payment_method,
                'status' => $request->input('status', 'pending'),
                'reference_number' => $request->reference_number,
                'notes' => $request->notes,
                'paid_at' => $request->status === 'paid' || $request->input('status') === 'paid'
                    ? ($request->paid_at ?? now())
                    : $request->paid_at,
                'recorded_by' => $request->user()->id,
            ]);

            if ($request->boolean('create_membership') && $request->filled('membership_plan_id')) {
                $plan = MembershipPlan::findOrFail($request->membership_plan_id);

                Membership::where('member_id', $request->member_id)
                    ->where('status', 'active')
                    ->update(['status' => 'expired']);

                $membership = Membership::create([
                    'member_id' => $request->member_id,
                    'membership_plan_id' => $plan->id,
                    'start_date' => $request->membership_start_date,
                    'end_date' => $request->membership_end_date ?? now()->addDays($plan->duration_days)->toDateString(),
                    'amount' => $plan->price,
                    'status' => 'active',
                    'created_by' => $request->user()->id,
                ]);

                $payment->update(['membership_id' => $membership->id]);
                Member::whereKey($request->member_id)->update(['status' => 'active']);
            }

            return $payment;
        });

        return response()->json([
            'message' => 'Payment recorded successfully.',
            'data' => new PaymentResource($payment->load(['member', 'plan'])),
        ], 201);
    }

    public function show(Payment $payment): JsonResponse
    {
        return response()->json([
            'data' => new PaymentResource($payment->load(['member', 'plan', 'membership.plan'])),
        ]);
    }

    public function update(PaymentRequest $request, Payment $payment): JsonResponse
    {
        $payment->update($request->safe()->except(['member_id', 'create_membership', 'membership_start_date', 'membership_end_date']));

        if ($request->status === 'paid' && ! $payment->paid_at) {
            $payment->update(['paid_at' => $request->paid_at ?? now()]);
        }

        return response()->json([
            'message' => 'Payment updated successfully.',
            'data' => new PaymentResource($payment->fresh()->load(['member', 'plan'])),
        ]);
    }

    private function generatePaymentNumber(): string
    {
        do {
            $number = 'PAY-' . now()->format('Ymd') . '-' . str_pad((string) (Payment::max('id') + 1), 5, '0', STR_PAD_LEFT);
        } while (Payment::where('payment_number', $number)->exists());

        return $number;
    }
}
