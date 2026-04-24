<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user()->load(['fixedDeductions', 'notifications', 'expenses']);
        return response()->json([
            'success' => true,
            'salary' => $user->salary,
            'fixedDeductions' => $user->fixedDeductions,
            'notifications' => $user->notifications,
            'expenses' => $user->expenses,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        // Update salary if provided
        if ($request->has('salary')) {
            $user->salary = $request->input('salary');
            $user->save();
        }

        // Sync fixed deductions
        if ($request->has('fixedDeductions')) {
            $user->fixedDeductions()->delete();
            foreach ($request->input('fixedDeductions', []) as $deduction) {
                $user->fixedDeductions()->create($deduction);
            }
        }

        // Sync notifications
        if ($request->has('notifications')) {
            $user->notifications()->delete();
            foreach ($request->input('notifications', []) as $notification) {
                $user->notifications()->create($notification);
            }
        }

        // Sync expenses
        if ($request->has('expenses')) {
            $user->expenses()->delete();
            foreach ($request->input('expenses', []) as $expense) {
                $user->expenses()->create($expense);
            }
        }

        return response()->json(['success' => true]);
    }

    public function updateSalary(Request $request)
    {
        $request->validate(['salary' => 'required|integer|min:0']);
        $user = $request->user();
        $user->salary = $request->input('salary');
        $user->save();

        return response()->json(['success' => true, 'salary' => $user->salary]);
    }
}

