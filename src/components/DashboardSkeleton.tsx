export default function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar Skeleton */}
            <div className="bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200"></div>
                            <div className="h-6 w-24 animate-pulse rounded bg-slate-200"></div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-24 animate-pulse rounded bg-slate-200"></div>
                            <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200"></div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <div className="h-8 w-48 animate-pulse rounded bg-slate-200 mb-2"></div>
                    <div className="h-4 w-64 animate-pulse rounded bg-slate-200"></div>
                </div>

                {/* Stats Grid Skeleton */}
                <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100"></div>
                                <div className="h-4 w-12 animate-pulse rounded bg-slate-100"></div>
                            </div>
                            <div className="h-8 w-16 animate-pulse rounded bg-slate-200 mb-1"></div>
                            <div className="h-4 w-24 animate-pulse rounded bg-slate-100"></div>
                        </div>
                    ))}
                </div>

                {/* Content Area Skeleton */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                        <div className="h-6 w-32 animate-pulse rounded bg-slate-200"></div>
                        <div className="h-8 w-24 animate-pulse rounded bg-slate-200"></div>
                    </div>
                    <div className="p-6 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                                <div className="space-y-2">
                                    <div className="h-5 w-48 animate-pulse rounded bg-slate-200"></div>
                                    <div className="h-4 w-32 animate-pulse rounded bg-slate-100"></div>
                                </div>
                                <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
