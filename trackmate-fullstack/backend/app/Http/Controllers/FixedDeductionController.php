<?php

namespace App\Http\Controllers;

use App\Models\FixedDeduction;
use Illuminate\Http\Request;

class FixedDeductionController extends Controller
{
    public function index(Request $request)
    {
        $deductions = $request->user()->fixedDeductions;
        return response()->json(['success' => true, 'deductions' => $deductions]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|integer|min:0',
        ]);

        $deduction = $request->user()->fixedDeductions()->create($validated);
        return response()->json(['success' => true, 'deduction' => $deduction]);
    }

    public function update(Request $request, FixedDeduction $deduction)
    {
        if ($deduction->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|integer|min:0',
        ]);

        $deduction->update($validated);
        return response()->json(['success' => true, 'deduction' => $deduction]);
    }

    public function destroy(Request $request, FixedDeduction $deduction)
    {
        if ($deduction->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $deduction->delete();
        return response()->json(['success' => true]);
    }
}

