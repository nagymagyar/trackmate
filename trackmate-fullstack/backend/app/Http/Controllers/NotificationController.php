<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications;
        return response()->json(['success' => true, 'notifications' => $notifications]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|integer|min:0',
            'day' => 'required|integer|min:1|max:31',
            'recurring' => 'boolean',
        ]);

        $notification = $request->user()->notifications()->create($validated);
        return response()->json(['success' => true, 'notification' => $notification]);
    }

    public function update(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|integer|min:0',
            'day' => 'required|integer|min:1|max:31',
            'recurring' => 'boolean',
        ]);

        $notification->update($validated);
        return response()->json(['success' => true, 'notification' => $notification]);
    }

    public function destroy(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $notification->delete();
        return response()->json(['success' => true]);
    }
}

