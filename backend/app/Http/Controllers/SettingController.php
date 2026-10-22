<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\GymSetting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class SettingController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(['data' => GymSetting::allMap()]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $data = $request->validate([
            'gym_name' => ['sometimes', 'string', 'max:255'],
            'gym_logo' => ['nullable', 'string'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:500'],
            'operating_hours' => ['nullable', 'string', 'max:255'],
            'currency' => ['nullable', 'string', 'max:10'],
            'timezone' => ['nullable', 'string', 'max:60'],
        ]);

        foreach ($data as $key => $value) {
            GymSetting::set($key, $value);
        }

        return response()->json([
            'message' => 'Settings saved successfully.',
            'data' => GymSetting::allMap(),
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $users = User::when($request->filled('role') && $request->query('role') !== 'all', fn ($q) => $q->where('role', $request->query('role')))
            ->orderByDesc('created_at')
            ->paginate(min((int) $request->query('per_page', 15), 100));

        return response()->json([
            'data' => UserResource::collection($users->items()),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function storeUser(Request $request): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::min(8)],
            'role' => ['required', 'in:admin,staff,trainer,member'],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        $user = User::create($data);

        return response()->json([
            'message' => 'User created successfully.',
            'data' => new UserResource($user),
        ], 201);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'role' => ['sometimes', 'in:admin,staff,trainer,member'],
            'phone' => ['nullable', 'string', 'max:30'],
            'is_active' => ['sometimes', 'boolean'],
            'password' => ['nullable', Password::min(8)],
        ]);

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json([
            'message' => 'User updated successfully.',
            'data' => new UserResource($user),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'current_password' => ['required_with:password'],
            'password' => ['nullable', 'confirmed', Password::min(8)],
        ]);

        if (! empty($data['password'])) {
            if (! Hash::check($data['current_password'], $user->password)) {
                return response()->json(['message' => 'Current password is incorrect.'], 422);
            }
            $user->password = $data['password'];
        }

        $user->name = $data['name'] ?? $user->name;
        $user->phone = $data['phone'] ?? $user->phone;
        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'data' => new UserResource($user),
        ]);
    }
}
