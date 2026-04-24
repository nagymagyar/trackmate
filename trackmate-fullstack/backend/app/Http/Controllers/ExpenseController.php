<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $expenses = $request->user()->expenses()->orderBy('date', 'desc')->get();
        return response()->json(['success' => true, 'expenses' => $expenses]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'amount' => 'required|integer|min:0',
            'description' => 'nullable|string',
        ]);

        $expense = $request->user()->expenses()->create($validated);
        return response()->json(['success' => true, 'expense' => $expense]);
    }

    public function update(Request $request, Expense $expense)
    {
        if ($expense->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'date' => 'required|date',
            'amount' => 'required|integer|min:0',
            'description' => 'nullable|string',
        ]);

        $expense->update($validated);
        return response()->json(['success' => true, 'expense' => $expense]);
    }

    public function destroy(Request $request, Expense $expense)
    {
        if ($expense->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $expense->delete();
        return response()->json(['success' => true]);
    }
}

