<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:users,name',
            'email' => 'nullable|string|email|max:255|unique:users',
            'password' => 'required|string|min:4',
        ]);

        $email = $request->email ?: $request->username . '@tracky.local';

        $user = User::create([
            'name' => $request->username,
            'email' => $email,
            'password' => Hash::make($request->password),
            'salary' => 0,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'userId' => (string) $user->id,
            'token' => $token,
            'is_admin' => $user->is_admin,
            'user' => $user,
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('name', $request->username)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Hibás felhasználónév vagy jelszó',
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'userId' => (string) $user->id,
            'token' => $token,
            'is_admin' => $user->is_admin,
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kijelentkezés sikeres',
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load(['fixedDeductions', 'notifications', 'expenses']);
        return response()->json([
            'success' => true,
            'user' => $user,
        ]);
    }
}

