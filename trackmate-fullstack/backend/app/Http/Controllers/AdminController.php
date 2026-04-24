<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function users(Request $request)
    {
        $users = User::withCount('expenses')->withSum('expenses', 'amount')->get();
        return response()->json([
            'success' => true,
            'users' => $users,
            'totalUsers' => $users->count(),
        ]);
    }

    public function userDetail(Request $request, User $user)
    {
        $user->load(['fixedDeductions', 'notifications', 'expenses']);
        return response()->json(['success' => true, 'user' => $user]);
    }

    public function createUser(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:users,name',
            'email' => 'nullable|string|email|max:255|unique:users',
            'password' => 'required|string|min:4',
            'salary' => 'integer|min:0',
        ]);

        $email = $validated['email'] ?? ($validated['username'] . '@tracky.local');

        $user = User::create([
            'name' => $validated['username'],
            'email' => $email,
            'password' => Hash::make($validated['password']),
            'salary' => $validated['salary'] ?? 0,
        ]);

        return response()->json(['success' => true, 'user' => $user]);
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'salary' => 'integer|min:0',
            'email' => 'nullable|string|email|max:255',
        ]);

        $user->update($validated);
        return response()->json(['success' => true, 'user' => $user]);
    }

    public function deleteUser(Request $request, User $user)
    {
        // Prevent deleting yourself
        if ($user->id === $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Cannot delete yourself'], 400);
        }

        $user->delete();
        return response()->json(['success' => true]);
    }

    public function stats(Request $request)
    {
        $totalUsers = User::count();
        $totalExpenses = \App\Models\Expense::count();
        $totalSpent = \App\Models\Expense::sum('amount');
        $averageSalary = User::avg('salary');

        return response()->json([
            'success' => true,
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalExpenses' => $totalExpenses,
                'totalSpent' => $totalSpent,
                'averageSalary' => round($averageSalary, 2),
            ],
        ]);
    }
}

