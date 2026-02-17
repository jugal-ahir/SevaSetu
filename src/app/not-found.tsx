import Link from "next/link";
import { ExclamationTriangleIcon, HomeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Official Seal / Icon */}
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 border-4 border-slate-200">
                    <ExclamationTriangleIcon className="h-12 w-12 text-slate-400" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter">404</h1>
                    <h2 className="text-2xl font-bold text-slate-800">Page Not Found</h2>
                    <p className="text-slate-600">
                        The requested resource could not be located on the SevaSetu portal.
                        It may have been moved, archived, or is temporarily unavailable.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
                    >
                        <HomeIcon className="h-5 w-5" />
                        Return Home
                    </Link>

                    <Link
                        href="/citizen/dashboard"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Dashboard
                    </Link>
                </div>

                <div className="pt-12 border-t border-slate-200">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                        SevaSetu • Government of India
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                        Official Grievance Redressal System
                    </p>
                </div>
            </div>
        </div>
    );
}
