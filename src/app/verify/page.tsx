"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheckIcon, IdentificationIcon } from "@heroicons/react/24/outline";

export default function VerifyPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nationalId: "",
        dob: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                        <ShieldCheckIcon className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Identity Verification</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Verify your identity to access all features
                    </p>
                </div>

                {/* Verification Form */}
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
                    <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
                        <p className="text-sm text-blue-700">
                            <strong>Demo Mode:</strong> Use any National ID and date of birth to verify. In production, this would validate against a government database.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="nationalId" className="block text-sm font-medium text-slate-700">
                                National ID / Aadhaar Number
                            </label>
                            <div className="relative mt-2">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <IdentificationIcon className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="nationalId"
                                    type="text"
                                    required
                                    value={formData.nationalId}
                                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                                    className="block w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="1234 5678 9012"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-slate-700">
                                Date of Birth
                            </label>
                            <input
                                id="dob"
                                type="date"
                                required
                                value={formData.dob}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white py-3 px-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying Identity...
                                </>
                            ) : (
                                "Verify Identity"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
