import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function formatTime(value) {
    if (!value) {
        return '';
    }

    return new Date(value).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function ChatIndex({ users, selectedUser, messages }) {
    const authUser = usePage().props.auth.user;
    const [messageItems, setMessageItems] = useState(messages);

    const { data, setData, post, transform, processing, reset, errors } = useForm({
        message: '',
    });

    useEffect(() => {
        setMessageItems(messages);
    }, [messages]);

    useEffect(() => {
        if (!selectedUser || !window.Echo) {
            return;
        }

        const channelName = `chat.user.${authUser.id}`;

        const channel = window.Echo.private(channelName);

        channel.listen('.message.sent', (event) => {
            const incomingMessage = event?.message;

            if (!incomingMessage?.id) {
                return;
            }

            const belongsToOpenConversation =
                (incomingMessage.sender_id === selectedUser.id &&
                    incomingMessage.receiver_id === authUser.id) ||
                (incomingMessage.sender_id === authUser.id &&
                    incomingMessage.receiver_id === selectedUser.id);

            if (!belongsToOpenConversation) {
                return;
            }

            setMessageItems((previousMessages) => {
                if (previousMessages.some((item) => item.id === incomingMessage.id)) {
                    return previousMessages;
                }

                return [...previousMessages, incomingMessage];
            });
        });

        return () => {
            channel.stopListening('.message.sent');
            window.Echo.leave(channelName);
        };
    }, [authUser.id, selectedUser?.id]);

    const submit = (event) => {
        event.preventDefault();

        if (!selectedUser) {
            return;
        }

        transform((formData) => ({
            ...formData,
            receiver_id: selectedUser.id,
        })).post(route('chat.messages.store'), {
            preserveScroll: true,
            onSuccess: () => reset('message'),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Chat
                </h2>
            }
        >
            <Head title="Chat" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid min-h-[70vh] grid-cols-1 gap-6 lg:grid-cols-3">
                        <aside className="overflow-hidden rounded-lg bg-white shadow-sm lg:col-span-1">
                            <div className="border-b px-4 py-3">
                                <h3 className="font-semibold text-gray-900">
                                    Users
                                </h3>
                            </div>

                            <div className="divide-y">
                                {users.map((user) => (
                                    <Link
                                        key={user.id}
                                        href={route('chat.index', {
                                            user_id: user.id,
                                        })}
                                        className={`block px-4 py-3 transition ${
                                            selectedUser?.id === user.id
                                                ? 'bg-indigo-50'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <p className="font-medium text-gray-900">
                                            {user.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {user.email}
                                        </p>
                                        {user.last_message && (
                                            <p className="mt-1 truncate text-xs text-gray-500">
                                                {user.last_message}
                                            </p>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </aside>

                        <section className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm lg:col-span-2">
                            <div className="border-b px-4 py-3">
                                <h3 className="font-semibold text-gray-900">
                                    {selectedUser
                                        ? `Conversation with ${selectedUser.name}`
                                        : 'Select a user'}
                                </h3>
                            </div>

                            <div className="flex-1 space-y-3 overflow-y-auto p-4">
                                {!selectedUser && (
                                    <p className="text-sm text-gray-500">
                                        Pick a user from the left to start chatting.
                                    </p>
                                )}

                                {selectedUser && messageItems.length === 0 && (
                                    <p className="text-sm text-gray-500">
                                        No messages yet.
                                    </p>
                                )}

                                {messageItems.map((message) => {
                                    const isMine = message.sender_id === authUser.id;

                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex ${
                                                isMine
                                                    ? 'justify-end'
                                                    : 'justify-start'
                                            }`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                                    isMine
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-100 text-gray-900'
                                                }`}
                                            >
                                                <p>{message.message}</p>
                                                <p
                                                    className={`mt-1 text-xs ${
                                                        isMine
                                                            ? 'text-indigo-200'
                                                            : 'text-gray-500'
                                                    }`}
                                                >
                                                    {message.sender_name} ·{' '}
                                                    {formatTime(
                                                        message.created_at,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <form
                                onSubmit={submit}
                                className="border-t px-4 py-3"
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={data.message}
                                        onChange={(event) => {
                                            setData('message', event.target.value);
                                        }}
                                        placeholder={
                                            selectedUser
                                                ? 'Type your message...'
                                                : 'Select a user first'
                                        }
                                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        disabled={!selectedUser || processing}
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={
                                            !selectedUser ||
                                            processing ||
                                            !data.message.trim()
                                        }
                                    >
                                        Send
                                    </button>
                                </div>

                                {errors.message && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.message}
                                    </p>
                                )}
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
