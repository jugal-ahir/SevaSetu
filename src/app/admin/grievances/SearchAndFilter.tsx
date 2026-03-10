"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function SearchAndFilter({ initialQuery, initialStatus }: { initialQuery: string, initialStatus: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const [query, setQuery] = useState(initialQuery);
    const [status, setStatus] = useState(initialStatus);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams();
            if (query) params.set("q", query);
            if (status) params.set("status", status);
            router.push(`${pathname}?${params.toString()}`);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [query, status, router, pathname]);

    const statuses = ["SUBMITTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "ESCALATED"];

    return (
        <div className="p-4 border-b border-slate-200/60 bg-white/50">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search grievances by ID, title, or citizen..."
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all sm:text-sm font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${showFilters ? 'bg-amber-600 border-amber-600 text-white shadow-md' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        <AdjustmentsHorizontalIcon className="h-5 w-5" />
                        {status ? `Status: ${status}` : "Filter Views"}
                    </button>
                    {(query || status) && (
                        <button
                            onClick={() => { setQuery(""); setStatus(""); }}
                            className="p-2.5 rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Clear all filters"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            {showFilters && (
                <div className="mt-4 flex flex-wrap gap-2 animate-fade-in">
                    <button
                        onClick={() => setStatus("")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${status === "" ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                    >
                        ALL
                    </button>
                    {statuses.map(s => (
                        <button
                            key={s}
                            onClick={() => setStatus(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${status === s ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                        >
                            {s.replace("_", " ")}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
