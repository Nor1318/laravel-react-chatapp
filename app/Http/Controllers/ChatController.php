<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index(Request $request): Response
    {
        $authUser = $request->user();

        $baseUsers = User::query()
            ->whereKeyNot($authUser->id)
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        $conversations = Conversation::query()
            ->with('lastMessage:id,message,created_at')
            ->where(function ($query) use ($authUser) {
                $query
                    ->where('user_id1', $authUser->id)
                    ->orWhere('user_id2', $authUser->id);
            })
            ->get();

        $users = $baseUsers
            ->map(function (User $user) use ($authUser, $conversations) {
                $conversation = $conversations->first(function (Conversation $conversation) use ($authUser, $user) {
                    return ($conversation->user_id1 === $authUser->id && $conversation->user_id2 === $user->id)
                        || ($conversation->user_id2 === $authUser->id && $conversation->user_id1 === $user->id);
                });

                $lastMessageAt = $conversation?->lastMessage?->created_at;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'last_message' => $conversation?->lastMessage?->message,
                    'last_message_at' => $lastMessageAt?->toISOString(),
                    'sort_timestamp' => $lastMessageAt?->getTimestamp() ?? 0,
                ];
            })
            ->sortByDesc('sort_timestamp')
            ->values()
            ->map(function (array $user) {
                unset($user['sort_timestamp']);

                return $user;
            });

        $selectedUserId = $request->integer('user_id');
        $selectedUser = null;
        $messages = [];

        if ($selectedUserId) {
            $selectedUser = $users->firstWhere('id', $selectedUserId);

            if (! $selectedUser) {
                abort(404);
            }

            $conversation = $this->findConversationForUsers($authUser->id, $selectedUserId);

            if ($conversation) {
                $messages = $this->getConversationMessages($conversation->id);
            }
        }

        return Inertia::render('Chat/Index', [
            'users' => $users,
            'selectedUser' => $selectedUser,
            'messages' => $messages,
        ]);
    }

    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $authUser = $request->user();
        $trimmedMessage = trim((string) $request->input('message', ''));

        $validated = $request->validate([
            'receiver_id' => ['required', 'integer', 'exists:users,id', 'not_in:'.$authUser->id],
            'message' => ['required', 'string', 'max:5000'],
        ], [
            'message.required' => 'Message cannot be empty.',
        ]);

        if ($trimmedMessage === '') {
            throw ValidationException::withMessages([
                'message' => ['Message cannot be empty.'],
            ]);
        }

        [$firstUserId, $secondUserId] = $this->normalizeConversationUserIds(
            $authUser->id,
            (int) $validated['receiver_id'],
        );

        $conversation = $this->findConversationForUsers($firstUserId, $secondUserId);

        if (! $conversation) {
            try {
                $conversation = Conversation::create([
                    'user_id1' => $firstUserId,
                    'user_id2' => $secondUserId,
                ]);
            } catch (QueryException) {
                $conversation = $this->findConversationForUsers($firstUserId, $secondUserId);
            }
        }

        $message = Message::create([
            'message' => $trimmedMessage,
            'sender_id' => $authUser->id,
            'receiver_id' => $validated['receiver_id'],
            'conversation_id' => $conversation->id,
        ]);

        $message->load('sender:id,name');

        $conversation->update([
            'last_message_id' => $message->id,
        ]);

        MessageSent::dispatch($message);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => [
                    'id' => $message->id,
                    'message' => $message->message,
                    'sender_id' => $message->sender_id,
                    'receiver_id' => $message->receiver_id,
                    'sender_name' => $message->sender?->name,
                    'created_at' => $message->created_at?->toISOString(),
                ],
            ]);
        }

        return redirect()->route('chat.index', [
            'user_id' => $validated['receiver_id'],
        ]);
    }

    private function findConversationForUsers(int $firstUserId, int $secondUserId): ?Conversation
    {
        return Conversation::query()
            ->where('user_id1', $firstUserId)
            ->where('user_id2', $secondUserId)
            ->first();
    }

    private function normalizeConversationUserIds(int $firstUserId, int $secondUserId): array
    {
        return [
            min($firstUserId, $secondUserId),
            max($firstUserId, $secondUserId),
        ];
    }

    private function getConversationMessages(int $conversationId)
    {
        return Message::query()
            ->where('conversation_id', $conversationId)
            ->with(['sender:id,name'])
            ->orderBy('id')
            ->get()
            ->map(fn (Message $message) => [
                'id' => $message->id,
                'message' => $message->message,
                'sender_id' => $message->sender_id,
                'receiver_id' => $message->receiver_id,
                'sender_name' => $message->sender?->name,
                'created_at' => $message->created_at?->toISOString(),
            ]);
    }
}
