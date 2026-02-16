import { BuildingLibraryIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function MaintenancePage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-600 shadow-2xl shadow-blue-500/20">
                <BuildingLibraryIcon className="h-12 w-12 text-white" />
            </div>

            <h1 className="mb-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                SevaSetu <span className="text-blue-600">Under Maintenance</span>
            </h1>

            <p className="mb-12 max-w-lg text-lg font-medium text-slate-600 leading-relaxed">
                We're currently performing some essential system upgrades to serve you better.
                Normal services will be restored shortly. Thank you for your patience.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                    href="/login"
                    className="rounded-2xl bg-white px-8 py-4 text-sm font-bold text-slate-900 shadow-sm border border-slate-200 transition-all hover:bg-slate-50"
                >
                    Administrative Login
                </Link>
                <Link
                    href="mailto:support@sevasetu.gov"
                    className="rounded-2xl bg-slate-900 px-8 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-black"
                >
                    Contact Support
                </Link>
            </div>

            <div className="mt-16 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Urban Governance Portal • Ahmedabad Municipal Corporation
            </div>
        </div>
    );
}
