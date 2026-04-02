import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Chat App" />
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <div className="mx-auto max-w-4xl px-6 py-10">
                    <header className="flex items-center justify-between border-b border-slate-200 pb-6">
                        <h1 className="text-2xl font-bold">Chat App</h1>
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-100"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <nav className="flex gap-2">
                                <Link
                                    href={route('login')}
                                    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-100"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
                                >
                                    Register
                                </Link>
                            </nav>
                        )}
                    </header>

                    <main className="mt-10 grid gap-6 md:grid-cols-2">
                        <section className="rounded-xl border border-slate-200 bg-white p-6">
                            <h2 className="text-3xl font-bold leading-tight">
                                Chat with your team in one place
                            </h2>
                            <p className="mt-4 text-slate-600">
                                Send realtime messages, organize conversations
                                in rooms, and stay updated without switching
                                tools.
                            </p>

                            <div className="mt-6 flex gap-3">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
                                    >
                                        Open app
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('register')}
                                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
                                        >
                                            Get started
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-100"
                                        >
                                            Sign in
                                        </Link>
                                    </>
                                )}
                            </div>
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white p-6">
                            <h3 className="text-lg font-semibold">Features</h3>
                            <ul className="mt-4 space-y-3 text-slate-700">
                                <li className="rounded-md bg-slate-50 p-3">
                                    Realtime room messaging
                                </li>
                                <li className="rounded-md bg-slate-50 p-3">
                                    Simple login and registration
                                </li>
                                <li className="rounded-md bg-slate-50 p-3">
                                    Built with Laravel and React
                                </li>
                            </ul>
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}
