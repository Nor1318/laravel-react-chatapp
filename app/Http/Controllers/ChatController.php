<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index(Request $request): Response
    {
        $authUser = $request->user();

        $users = User::query()
            ->whereKeyNot($authUser->id)
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        $selectedUserId = $request->integer('user_id');
        $selectedUser = null;
        $messages = [];

        if ($selectedUserId) {
            $selectedUser = $users->firstWhere('id', $selectedUserId);

            if (! $selectedUser) {
                abort(404);
            }

            $conversation = Conversation::query()
                ->where(function ($query) use ($authUser, $selectedUserId) {
                    $query
                        ->where('user_id1', $authUser->id)
                        ->where('user_id2', $selectedUserId);
                })
                ->orWhere(function ($query) use ($authUser, $selectedUserId) {
                    $query
                        ->where('user_id1', $selectedUserId)
                        ->where('user_id2', $authUser->id);
                })
                ->first();

            if ($conversation) {
                $messages = Message::query()
                    ->where('conversation_id', $conversation->id)
                    ->with(['sender:id,name'])
                    ->orderBy('id')
                    ->get()
                    ->map(fn (Message $message) => [
                        'id' => $message->id,
                        'message' => $message->message,
                        'sender_id' => $message->sender_id,
                        'sender_name' => $message->sender?->name,
                        'created_at' => $message->created_at?->toISOString(),
                    ]);
            }
        }

        return Inertia::render('Chat/Index', [
            'users' => $users,
            'selectedUser' => $selectedUser,
            'messages' => $messages,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $authUser = $request->user();

        $validated = $request->validate([
            'receiver_id' => ['required', 'integer', 'exists:users,id', 'not_in:'.$authUser->id],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $conversation = Conversation::query()
            ->where(function ($query) use ($authUser, $validated) {
                $query
                    ->where('user_id1', $authUser->id)
                    ->where('user_id2', $validated['receiver_id']);
            })
            ->orWhere(function ($query) use ($authUser, $validated) {
                $query
                    ->where('user_id1', $validated['receiver_id'])
                    ->where('user_id2', $authUser->id);
            })
            ->first();

        if (! $conversation) {
            $conversation = Conversation::create([
                'user_id1' => min($authUser->id, $validated['receiver_id']),
                'user_id2' => max($authUser->id, $validated['receiver_id']),
            ]);
        }

        $message = Message::create([
            'message' => trim($validated['message']),
            'sender_id' => $authUser->id,
            'receiver_id' => $validated['receiver_id'],
            'conversation_id' => $conversation->id,
        ]);

        $conversation->update([
            'last_message_id' => $message->id,
        ]);

        return redirect()->route('chat.index', [
            'user_id' => $validated['receiver_id'],
        ]);
    }
}
