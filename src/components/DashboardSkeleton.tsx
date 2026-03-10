export default function DashboardSkeleton() {
    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50/50">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-blue-200/5 blur-[130px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-5%] left-[-5%] w-[45%] h-[45%] bg-indigo-200/5 blur-[130px] rounded-full animate-pulse"></div>
            </div>

            {/* Navbar Skeleton */}
            <div className="bg-white/60 backdrop-blur-md border-b border-slate-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200"></div>
                            <div className="h-5 w-24 animate-pulse rounded bg-slate-200"></div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="h-4 w-16 animate-pulse rounded bg-slate-200"></div>
                            <div className="h-4 w-16 animate-pulse rounded bg-slate-200"></div>
                            <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200"></div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header Skeleton */}
                <div className="mb-10">
                    <div className="h-3 w-32 animate-pulse rounded bg-blue-100 mb-3 ml-1"></div>
                    <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200 mb-2"></div>
                    <div className="h-4 w-80 animate-pulse rounded bg-slate-100 ml-1"></div>
                </div>

                {/* Stats Grid Skeleton */}
                <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-[1.75rem] border border-slate-200/60 bg-white p-6 shadow-sm overflow-hidden relative">
                            <div className="flex items-center justify-between mb-6">
                                <div className="space-y-2">
                                    <div className="h-3 w-16 animate-pulse rounded bg-slate-100"></div>
                                    <div className="h-8 w-12 animate-pulse rounded-lg bg-slate-200"></div>
                                </div>
                                <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-50"></div>
                            </div>
                            <div className="h-3 w-24 animate-pulse rounded bg-slate-50"></div>
                        </div>
                    ))}
                </div>

                {/* Content Area Skeleton */}
                <div className="rounded-[2rem] border border-white/60 bg-white/40 backdrop-blur-2xl p-1 shadow-2xl shadow-blue-500/5 overflow-hidden">
                    <div className="bg-white/40 rounded-[1.85rem] p-8">
                        <div className="mb-8 flex items-end justify-between">
                            <div className="space-y-2">
                                <div className="h-6 w-48 animate-pulse rounded bg-slate-200"></div>
                                <div className="h-3 w-64 animate-pulse rounded bg-slate-100"></div>
                            </div>
                            <div className="h-5 w-32 animate-pulse rounded bg-slate-100"></div>
                        </div>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-white/50 border border-slate-50"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
