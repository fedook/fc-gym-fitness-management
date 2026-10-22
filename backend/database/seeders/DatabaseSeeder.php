<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\AttendanceRecord;
use App\Models\GymSetting;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Models\Trainer;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Demo accounts — FOR LOCAL TESTING ONLY. Never use in production.
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@gym.test',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '+63 917 123 4567',
        ]);

        User::create([
            'name' => 'Staff Member',
            'email' => 'staff@gym.test',
            'password' => Hash::make('password'),
            'role' => 'staff',
        ]);

        $plans = [
            ['name' => 'Weekly Pass', 'description' => 'Perfect for short-term visitors.', 'type' => 'weekly', 'duration_days' => 7, 'price' => 350, 'benefits' => ['Gym floor access', 'Locker room']],
            ['name' => 'Monthly Basic', 'description' => 'Full gym access for one month.', 'type' => 'monthly', 'duration_days' => 30, 'price' => 1200, 'benefits' => ['Gym floor access', 'Locker room', 'Group classes']],
            ['name' => 'Monthly Premium', 'description' => 'Monthly access with personal trainer sessions.', 'type' => 'monthly', 'duration_days' => 30, 'price' => 2500, 'benefits' => ['Gym floor access', 'Locker room', 'Group classes', '2 PT sessions', 'Sauna']],
            ['name' => 'Quarterly Plus', 'description' => 'Three months of unlimited access.', 'type' => 'quarterly', 'duration_days' => 90, 'price' => 3200, 'benefits' => ['Gym floor access', 'Locker room', 'Group classes', '4 PT sessions']],
            ['name' => 'Annual Elite', 'description' => 'Best value — full year membership.', 'type' => 'annual', 'duration_days' => 365, 'price' => 11000, 'benefits' => ['Gym floor access', 'Locker room', 'Group classes', '12 PT sessions', 'Sauna', 'Guest passes']],
        ];

        $planModels = collect($plans)->map(fn ($p) => MembershipPlan::create($p + ['status' => 'active']));

        $trainersData = [
            ['first_name' => 'Marco', 'last_name' => 'Santos', 'email' => 'marco.trainer@gym.test', 'phone' => '+63 918 111 2222', 'specialization' => 'Strength & Conditioning', 'availability' => 'Mon-Fri 6AM-2PM', 'bio' => 'Certified strength coach with 8 years of experience.'],
            ['first_name' => 'Ana', 'last_name' => 'Reyes', 'email' => 'ana.trainer@gym.test', 'phone' => '+63 919 333 4444', 'specialization' => 'Yoga & Flexibility', 'availability' => 'Tue-Sat 8AM-5PM', 'bio' => 'Registered yoga instructor specializing in mobility.'],
            ['first_name' => 'James', 'last_name' => 'Cruz', 'email' => 'james.trainer@gym.test', 'phone' => '+63 920 555 6666', 'specialization' => 'Cardio & HIIT', 'availability' => 'Mon-Sat 2PM-10PM', 'bio' => 'Former athlete focused on high-intensity training.'],
        ];

        $trainerModels = collect($trainersData)->map(fn ($t) => Trainer::create($t + ['status' => 'active']));

        $firstNames = ['John', 'Maria', 'Jose', 'Angel', 'Paolo', 'Camille', 'Miguel', 'Sofia', 'Daniel', 'Bea', 'Carlo', 'Liza', 'Noel', 'Grace', 'Ryan', 'Mia', 'Kevin', 'Hannah', 'Leo', 'Chloe', 'Mark', 'Iris', 'Aaron', 'Zoe', 'Ben', 'Lucy', 'Sam', 'Nora', 'Eli', 'Tara'];
        $lastNames = ['Dela Cruz', 'Santos', 'Reyes', 'Garcia', 'Mendoza', 'Torres', 'Villanueva', 'Bautista', 'Navarro', 'Flores', 'Aquino', 'Castillo', 'Ramos', 'Panganiban', 'Lim', 'Ocampo', 'Chua', 'Tan', 'Sy', 'Cruz'];

        $memberModels = collect()->range(0, 29)->map(function ($i) use ($firstNames, $lastNames, $admin) {
            $first = $firstNames[$i];
            $last = $lastNames[$i % count($lastNames)];
            $status = match ($i % 10) {
                0, 7 => 'pending',
                8 => 'suspended',
                9 => 'expired',
                default => 'active',
            };

            $user = null;
            if ($i < 5) {
                $user = User::create([
                    'name' => "$first $last",
                    'email' => strtolower($first) . ($i + 1) . '@member.test',
                    'password' => Hash::make('password'),
                    'role' => 'member',
                ]);
            }

            return Member::create([
                'user_id' => $user?->id,
                'member_code' => 'GYM-26-' . str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT),
                'first_name' => $first,
                'last_name' => $last,
                'email' => strtolower($first) . ($i + 1) . '@example.com',
                'phone' => '+63 9' . random_int(10, 99) . ' ' . random_int(100, 999) . ' ' . random_int(1000, 9999),
                'address' => random_int(1, 99) . ' Sample St., Metro Manila',
                'date_of_birth' => Carbon::now()->subYears(random_int(18, 55))->subMonths(random_int(0, 11))->toDateString(),
                'gender' => $i % 2 === 0 ? 'male' : 'female',
                'emergency_contact_name' => $lastNames[($i + 3) % count($lastNames)] . ' Emergency',
                'emergency_contact_phone' => '+63 917 ' . random_int(100, 999) . ' ' . random_int(1000, 9999),
                'status' => $status,
            ]);
        });

        // Memberships + payments over the last 12 months
        foreach ($memberModels as $index => $member) {
            if ($member->status === 'pending') {
                continue;
            }

            $plan = $planModels->random();
            $start = Carbon::now()->subMonthsNoOverflow(random_int(0, 11))->subDays(random_int(0, 25));
            $end = $start->copy()->addDays($plan->duration_days);
            $membershipStatus = $end->isPast() ? 'expired' : 'active';

            if ($member->status === 'expired') {
                $membershipStatus = 'expired';
                $end = Carbon::now()->subDays(random_int(1, 30));
            }

            $membership = Membership::create([
                'member_id' => $member->id,
                'membership_plan_id' => $plan->id,
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'amount' => $plan->price,
                'status' => $membershipStatus === 'active' && $member->status === 'active' ? 'active' : $membershipStatus,
                'created_by' => $admin->id,
            ]);

            $paidAt = $start->copy()->addHours(random_int(0, 12));
            $status = $member->status === 'suspended' && $index % 3 === 0 ? 'pending' : 'paid';

            Payment::create([
                'payment_number' => 'PAY-' . $paidAt->format('Ymd') . '-' . str_pad((string) ($index + 1), 5, '0', STR_PAD_LEFT),
                'member_id' => $member->id,
                'membership_id' => $membership->id,
                'membership_plan_id' => $plan->id,
                'amount' => $plan->price,
                'payment_method' => ['cash', 'card', 'bank_transfer', 'e_wallet'][random_int(0, 3)],
                'status' => $status,
                'reference_number' => $status === 'paid' ? 'REF' . random_int(100000, 999999) : null,
                'paid_at' => $status === 'paid' ? $paidAt : null,
                'recorded_by' => $admin->id,
                'created_at' => $paidAt,
                'updated_at' => $paidAt,
            ]);
        }

        // Attendance for the last 30 days
        $activeMembers = $memberModels->where('status', 'active');
        foreach (range(0, 29) as $dayOffset) {
            $date = Carbon::now()->subDays($dayOffset);
            if ($date->isSunday()) {
                continue;
            }

            $visitors = $activeMembers->shuffle()->take(random_int(3, 12));
            foreach ($visitors as $visitor) {
                $checkIn = $date->copy()->setTime(random_int(6, 11), random_int(0, 59));
                $checkedOut = random_int(0, 1) === 1 ? $checkIn->copy()->addMinutes(random_int(45, 150)) : null;

                AttendanceRecord::create([
                    'member_id' => $visitor->id,
                    'date' => $date->toDateString(),
                    'check_in' => $checkIn,
                    'check_out' => $checkedOut,
                    'status' => $checkIn->hour >= 10 ? 'late' : 'present',
                ]);
            }
        }

        // Appointments
        $appointmentTypes = ['Personal Training', 'Nutrition Consultation', 'Group Class', 'Body Assessment', 'Recovery Session'];
        $statuses = ['scheduled', 'completed', 'cancelled'];

        foreach (range(1, 15) as $i) {
            $scheduledAt = Carbon::now()->addDays(random_int(-10, 20))->setTime(random_int(7, 19), [0, 30][random_int(0, 1)]);

            Appointment::create([
                'member_id' => $activeMembers->random()->id,
                'trainer_id' => $trainerModels->random()->id,
                'title' => $appointmentTypes[array_rand($appointmentTypes)],
                'type' => $appointmentTypes[array_rand($appointmentTypes)],
                'scheduled_at' => $scheduledAt,
                'duration_minutes' => [30, 60, 90][random_int(0, 2)],
                'status' => $scheduledAt->isFuture() ? 'scheduled' : $statuses[random_int(0, 2)],
                'notes' => null,
            ]);
        }

        $settings = [
            'gym_name' => 'FC Fitness Gym',
            'contact_email' => 'info@fcfitnessgym.test',
            'contact_phone' => '+63 930 482 0781',
            'address' => '133 Purok Kamatis Alegria, Cordova, Cebu',
            'operating_hours' => 'Mon-Sat 10:00 AM - 10:00 PM, Sun 8:00 AM - 6:00 PM',
            'currency' => 'PHP',
            'timezone' => 'Asia/Manila',
        ];

        foreach ($settings as $key => $value) {
            GymSetting::set($key, $value);
        }
    }
}
