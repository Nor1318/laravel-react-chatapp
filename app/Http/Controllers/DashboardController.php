<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $totalMessages = Message::query()
            ->where('sender_id', $request->user()->id)
            ->count();

        return Inertia::render('Dashboard', [
            'totalMessages' => $totalMessages,
        ]);
    }
}
