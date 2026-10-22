<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Models\Trainer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function createMemberUser(): User
    {
        return User::factory()->create(['role' => 'member']);
    }

    public function test_admin_can_login_and_receive_token(): void
    {
        $user = $this->createAdmin();

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertOk()->assertJsonStructure(['token', 'user']);
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        $user = $this->createAdmin();

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
    }

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $this->getJson('/api/members')->assertUnauthorized();
        $this->getJson('/api/dashboard/summary')->assertUnauthorized();
    }

    public function test_member_role_cannot_access_admin_api(): void
    {
        $user = $this->createMemberUser();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/members')
            ->assertForbidden();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/settings')
            ->assertForbidden();
    }

    public function test_admin_can_list_and_create_members(): void
    {
        $admin = $this->createAdmin();
        $plan = MembershipPlan::create([
            'name' => 'Monthly',
            'type' => 'monthly',
            'duration_days' => 30,
            'price' => 1000,
            'status' => 'active',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/members')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta']);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/members', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '+63 917 000 0000',
            'plan_id' => $plan->id,
            'membership_start_date' => now()->toDateString(),
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('members', ['email' => 'john@example.com', 'status' => 'active']);
        $this->assertDatabaseHas('memberships', ['member_id' => Member::where('email', 'john@example.com')->first()->id, 'status' => 'active']);
    }

    public function test_member_search_and_filter(): void
    {
        $admin = $this->createAdmin();

        Member::create(['member_code' => 'GYM-0001', 'first_name' => 'Alpha', 'last_name' => 'One', 'email' => 'alpha@test.com', 'status' => 'active']);
        Member::create(['member_code' => 'GYM-0002', 'first_name' => 'Beta', 'last_name' => 'Two', 'email' => 'beta@test.com', 'status' => 'suspended']);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/members?search=Alpha')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/members?status=suspended')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_member_pagination_meta(): void
    {
        $admin = $this->createAdmin();

        Member::factory()->count(25)->create();

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/members?per_page=10');

        $response->assertOk()
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('meta.total', 25)
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.last_page', 3);
    }

    public function test_admin_can_manage_plans(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/plans', [
            'name' => 'Annual',
            'type' => 'annual',
            'duration_days' => 365,
            'price' => 10000,
            'status' => 'active',
        ]);

        $response->assertCreated();

        $plan = MembershipPlan::first();
        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/plans/{$plan->id}", ['name' => 'Annual Elite', 'type' => 'annual', 'duration_days' => 365, 'price' => 12000])
            ->assertOk()
            ->assertJsonPath('data.name', 'Annual Elite');
    }

    public function test_admin_can_record_payment_and_revenue_reflects(): void
    {
        $admin = $this->createAdmin();
        $member = Member::create(['member_code' => 'GYM-P01', 'first_name' => 'Pay', 'last_name' => 'Ment', 'email' => 'pay@test.com', 'status' => 'active']);

        $this->actingAs($admin, 'sanctum')->postJson('/api/payments', [
            'member_id' => $member->id,
            'amount' => 1500,
            'payment_method' => 'cash',
            'status' => 'paid',
        ])->assertCreated();

        $this->assertDatabaseHas('payments', ['member_id' => $member->id, 'status' => 'paid']);

        $summary = $this->actingAs($admin, 'sanctum')->getJson('/api/dashboard/summary');
        $summary->assertOk();
        $this->assertEquals(1500.0, (float) $summary->json('monthly_revenue'));
    }

    public function test_attendance_check_in_and_duplicate_prevention(): void
    {
        $admin = $this->createAdmin();
        $member = Member::create(['member_code' => 'GYM-A01', 'first_name' => 'Att', 'last_name' => 'Endance', 'email' => 'att@test.com', 'status' => 'active']);

        $this->actingAs($admin, 'sanctum')->postJson('/api/attendance/check-in', ['member_id' => $member->id])
            ->assertCreated();

        $this->actingAs($admin, 'sanctum')->postJson('/api/attendance/check-in', ['member_id' => $member->id])
            ->assertStatus(422);

        $this->actingAs($admin, 'sanctum')->postJson('/api/attendance/check-out', ['member_id' => $member->id])
            ->assertOk();
    }

    public function test_dashboard_summary_returns_all_stats(): void
    {
        $admin = $this->createAdmin();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/dashboard/summary')
            ->assertOk()
            ->assertJsonStructure([
                'total_members',
                'total_members_change',
                'today_check_ins',
                'today_check_ins_change',
                'monthly_revenue',
                'monthly_revenue_change',
                'expiring_soon',
            ]);
    }

    public function test_revenue_chart_range_returns_series(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/dashboard/revenue?range=6m');
        $response->assertOk()->assertJsonStructure(['data']);

        $this->assertCount(6, $response->json('data'));
    }

    public function test_admin_can_manage_trainers(): void
    {
        $admin = $this->createAdmin();

        $this->actingAs($admin, 'sanctum')->postJson('/api/trainers', [
            'first_name' => 'New',
            'last_name' => 'Trainer',
            'email' => 'newtrainer@test.com',
            'specialization' => 'Cardio',
        ])->assertCreated();

        $trainer = Trainer::first();
        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/trainers/{$trainer->id}", ['first_name' => 'Updated', 'last_name' => 'Trainer', 'email' => 'newtrainer@test.com', 'status' => 'inactive'])
            ->assertOk()
            ->assertJsonPath('data.status', 'inactive');
    }

    public function test_settings_persist(): void
    {
        $admin = $this->createAdmin();

        $this->actingAs($admin, 'sanctum')->putJson('/api/settings', [
            'gym_name' => 'Test Gym',
            'currency' => 'PHP',
        ])->assertOk();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/settings')
            ->assertOk()
            ->assertJsonPath('data.gym_name', 'Test Gym');
    }

    public function test_member_cannot_delete_member_with_active_membership(): void
    {
        $admin = $this->createAdmin();
        $plan = MembershipPlan::create(['name' => 'M', 'type' => 'monthly', 'duration_days' => 30, 'price' => 100, 'status' => 'active']);
        $member = Member::create(['member_code' => 'GYM-D01', 'first_name' => 'Del', 'last_name' => 'Ete', 'email' => 'del@test.com', 'status' => 'active']);

        \App\Models\Membership::create([
            'member_id' => $member->id,
            'membership_plan_id' => $plan->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonth()->toDateString(),
            'amount' => 100,
            'status' => 'active',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/members/{$member->id}")
            ->assertStatus(422);

        $this->assertDatabaseHas('members', ['id' => $member->id, 'deleted_at' => null]);
    }

    public function test_reports_endpoints_return_summary(): void
    {
        $admin = $this->createAdmin();

        $this->actingAs($admin, 'sanctum')->getJson('/api/reports/members')
            ->assertOk()
            ->assertJsonStructure(['summary', 'plan_distribution', 'rows']);

        $this->actingAs($admin, 'sanctum')->getJson('/api/reports/payments')
            ->assertOk()
            ->assertJsonStructure(['summary', 'monthly', 'rows']);

        $this->actingAs($admin, 'sanctum')->getJson('/api/reports/attendance')
            ->assertOk()
            ->assertJsonStructure(['summary', 'daily', 'rows']);
    }

    public function test_member_can_access_portal_endpoints(): void
    {
        $user = $this->createMemberUser();
        $plan = MembershipPlan::create(['name' => 'Gold', 'type' => 'monthly', 'duration_days' => 30, 'price' => 500, 'status' => 'active']);
        $member = Member::create([
            'user_id' => $user->id,
            'member_code' => 'GYM-P01',
            'first_name' => 'Por',
            'last_name' => 'Tal',
            'email' => $user->email,
            'status' => 'active',
        ]);
        $membership = \App\Models\Membership::create([
            'member_id' => $member->id,
            'membership_plan_id' => $plan->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonth()->toDateString(),
            'amount' => 500,
            'status' => 'active',
        ]);
        Payment::create([
            'payment_number' => 'PAY-P01',
            'member_id' => $member->id,
            'membership_id' => $membership->id,
            'membership_plan_id' => $plan->id,
            'amount' => 500,
            'payment_method' => 'cash',
            'status' => 'paid',
            'paid_at' => now(),
        ]);
        \App\Models\AttendanceRecord::create([
            'member_id' => $member->id,
            'date' => now()->toDateString(),
            'check_in' => now(),
            'status' => 'present',
        ]);

        $this->actingAs($user, 'sanctum')->getJson('/api/portal/profile')
            ->assertOk()
            ->assertJsonPath('data.member_code', 'GYM-P01');

        $this->actingAs($user, 'sanctum')->getJson('/api/portal/memberships')
            ->assertOk()
            ->assertJsonStructure(['data']);

        $this->actingAs($user, 'sanctum')->getJson('/api/portal/payments')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta']);

        $this->actingAs($user, 'sanctum')->getJson('/api/portal/attendance')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_admin_cannot_access_member_portal(): void
    {
        $admin = $this->createAdmin();

        $this->actingAs($admin, 'sanctum')->getJson('/api/portal/profile')
            ->assertForbidden();
    }

    public function test_register_creates_member_record_and_portal_works(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'New Member',
            'email' => 'newmember@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '09171234567',
        ]);

        $response->assertCreated()->assertJsonStructure(['token', 'user']);

        $user = User::where('email', 'newmember@test.com')->first();
        $this->assertNotNull($user->member);
        $this->assertSame('New', $user->member->first_name);
        $this->assertSame('Member', $user->member->last_name);

        $this->actingAs($user, 'sanctum')->getJson('/api/portal/profile')
            ->assertOk()
            ->assertJsonPath('data.email', 'newmember@test.com');
    }

    public function test_member_can_update_own_profile(): void
    {
        $user = $this->createMemberUser();
        Member::create([
            'user_id' => $user->id,
            'member_code' => 'GYM-U01',
            'first_name' => 'Old',
            'last_name' => 'Name',
            'email' => $user->email,
            'status' => 'active',
        ]);

        $this->actingAs($user, 'sanctum')->putJson('/api/portal/profile', [
            'first_name' => 'Updated',
            'last_name' => 'Profile',
            'phone' => '09999999999',
            'address' => '123 Test St',
            'gender' => 'male',
            'date_of_birth' => '1995-06-15',
            'emergency_contact_name' => 'Jane Doe',
            'emergency_contact_phone' => '09111111111',
        ])
            ->assertOk()
            ->assertJsonPath('data.first_name', 'Updated')
            ->assertJsonPath('data.last_name', 'Profile')
            ->assertJsonPath('data.address', '123 Test St');

        $this->assertSame('Updated Profile', $user->fresh()->name);
        $this->assertDatabaseHas('members', ['id' => $user->member->id, 'gender' => 'male', 'address' => '123 Test St']);
    }
}
