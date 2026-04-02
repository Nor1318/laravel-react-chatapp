import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ totalMessages }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid gap-6">
                        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <p className="text-sm text-indigo-600">Welcome back</p>
                            <h3 className="mt-1 text-2xl font-bold text-gray-900">
                                Your chat dashboard
                            </h3>
                            <p className="mt-2 text-gray-600">
                                Here is your total message count.
                            </p>
                        </section>

                        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <p className="text-sm text-gray-500">Total Messages</p>
                            <p className="mt-2 text-4xl font-bold text-gray-900">
                                {totalMessages}
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
