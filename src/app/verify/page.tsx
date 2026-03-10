"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheckIcon, IdentificationIcon, SparklesIcon } from "@heroicons/react/24/outline";
import AadharScanner from "@/components/AadharScanner";

export default function VerifyPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nationalId: "",
        dob: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const handleExtractionComplete = (data: { nationalId: string; dob: string }) => {
        setFormData((prev) => ({
            ...prev,
            nationalId: data.nationalId || prev.nationalId,
            dob: data.dob || prev.dob,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Verification failed");
            }

            // Redirect to citizen dashboard
            router.push("/citizen/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex selection:bg-blue-500/30">
            {/* Left Side: Visual / Brand */}
            <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-8 xl:p-12 overflow-hidden border-r border-slate-200/60 bg-white">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50/50 z-0"></div>
                <div className="absolute top-[-10%] right-[-20%] w-[80%] h-[80%] rounded-full bg-blue-500/10 blur-[130px] mix-blend-multiply pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[100px] mix-blend-multiply pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

                <div className="relative z-10 w-full animate-fade-in">
                    <Link href="/citizen/dashboard" className="inline-flex items-center gap-3 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xl shadow-blue-500/10 transition-transform duration-500 group-hover:scale-105 p-2 ring-1 ring-slate-100 border border-slate-50">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                                alt="National Emblem of India"
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <span className="text-2xl font-heading font-black tracking-tight text-slate-900 leading-none">SevaSetu</span>
                    </Link>
                </div>

                <div className="relative z-10 mb-20 animate-fade-in" style={{ animationDelay: "100ms" }}>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
                        Verification Required
                    </div>
                    <h2 className="text-4xl font-heading font-black text-slate-900 leading-[1.2] mb-6">
                        Secure your identity <br /> on the portal.
                    </h2>
                    <p className="text-lg text-slate-500 font-medium max-w-lg">
                        Verify your national identity to unlock full access to grievance filing, vehicle tracking, and direct communication with administrative officers.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-slate-400">
                    <span>© {new Date().getFullYear()} SevaSetu</span>
                    <span>•</span>
                    <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto bg-slate-50">
                {/* Mobile Background Elements */}
                <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[100px] mix-blend-multiply pointer-events-none lg:hidden" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none lg:hidden"></div>

                <div className="w-full max-w-md relative z-10 py-12 lg:py-0">
                    {/* Header */}
                    <div className="text-center lg:text-left mb-8">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <Link href="/citizen/dashboard" className="inline-flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xl shadow-blue-500/10 p-2 ring-1 ring-slate-100 border border-slate-50">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                                        alt="National Emblem of India"
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                            </Link>
                        </div>
                        <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight mb-2">Identity Verification</h1>
                        <p className="text-slate-500 text-sm">
                            Verify your identity to access all platform features.
                        </p>
                    </div>

                    {/* Verification Form */}
                    <div className="rounded-3xl border border-white bg-white/60 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/50">

                        {/* Scanner Promo */}
                        <div className="mb-8 rounded-2xl bg-blue-50 border border-blue-100 p-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500"></div>
                            <div className="relative z-10 flex flex-col gap-4">
                                <p className="text-sm font-medium text-slate-700">
                                    <strong className="text-blue-600 block mb-1">Smart Extraction</strong>
                                    Scan your Aadhar card to auto-fill these details instantly.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setIsScannerOpen(true)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 py-3 px-4 text-sm font-bold text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-all group/btn"
                                >
                                    <SparklesIcon className="h-5 w-5 text-blue-500 group-hover/btn:animate-pulse" />
                                    Initialize Scanner
                                </button>
                            </div>
                        </div>

                        {isScannerOpen && (
                            <AadharScanner
                                onExtractionComplete={handleExtractionComplete}
                                onClose={() => setIsScannerOpen(false)}
                            />
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-medium text-red-600 animate-slide-up">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="nationalId" className="block text-sm font-semibold text-slate-700 mb-2">
                                    National ID / Aadhaar Number
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <IdentificationIcon className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="nationalId"
                                        type="text"
                                        required
                                        value={formData.nationalId}
                                        onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                                        className="block w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                        placeholder="1234 5678 9012"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="dob" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    id="dob"
                                    type="date"
                                    required
                                    value={formData.dob}
                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                    className="block w-full rounded-xl border border-slate-200 bg-white py-3.5 px-4 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-8 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                        Verifying...
                                    </span>
                                ) : (
                                    "Confirm Identity"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
