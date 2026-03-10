"use client";

import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

export default function Loading() {
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
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-200"></div>
                        <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200"></div>
                    </div>
                    <div className="h-4 w-64 animate-pulse rounded bg-slate-200 ml-14"></div>
                </div>

                {/* Chat Container Skeleton */}
                <div className="flex flex-col h-[calc(100vh-14rem)] bg-white/40 backdrop-blur-2xl rounded-[2rem] border border-white/60 shadow-2xl overflow-hidden relative">
                    <div className="p-6 border-b border-slate-100 bg-white/20 flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="h-6 w-32 animate-pulse rounded bg-slate-200"></div>
                            <div className="h-3 w-48 animate-pulse rounded bg-slate-100"></div>
                        </div>
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-9 w-9 rounded-full bg-slate-100 border-2 border-white animate-pulse"></div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 p-6 space-y-8 overflow-hidden">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`flex gap-4 ${i % 2 === 0 ? "flex-row-reverse" : "flex-row"}`}>
                                <div className="h-10 w-10 rounded-2xl bg-slate-100 border border-slate-50 animate-pulse flex-shrink-0"></div>
                                <div className={`flex-1 max-w-[60%] space-y-2 ${i % 2 === 0 ? "text-right items-end" : "text-left items-start"}`}>
                                    <div className="h-3 w-24 animate-pulse rounded bg-slate-100"></div>
                                    <div className={`h-16 w-full animate-pulse rounded-2xl bg-slate-100 ${i % 2 === 0 ? "rounded-tr-none" : "rounded-tl-none"}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-white/20 border-t border-slate-100">
                        <div className="h-14 w-full animate-pulse bg-white/50 border border-slate-100 rounded-[1.25rem]"></div>
                    </div>
                </div>
            </main>
        </div>
    );
}
