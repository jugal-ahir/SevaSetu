"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            // Redirect based on role
            const role = data.user.role;
            if (role === "ADMIN" || role === "SUPER_ADMIN") {
                router.push("/admin/dashboard?noAnim=true");
            } else if (role === "DEPT_HEAD") {
                router.push("/dept-head/dashboard?noAnim=true");
            } else if (role === "OFFICER") {
                router.push("/officer/dashboard?noAnim=true");
            } else {
                router.push("/citizen/dashboard?noAnim=true");
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
        // Do not set loading to false on success to prevent button flickering before redirect
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-10 text-center flex flex-col items-center">
                    <Link href="/" className="inline-flex flex-col items-center gap-4 group">
                        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-2xl shadow-slate-200/50 transition-all p-3 relative overflow-hidden ring-1 ring-slate-100">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                                alt="National Emblem of India"
                                className="h-full w-full object-contain transition-all duration-700 hover:brightness-110"
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-black tracking-[0.3em] text-slate-900 uppercase">Government of India</span>
                            <div className="mt-1 h-0.5 w-12 bg-gradient-to-r from-orange-400 via-white to-green-500"></div>
                        </div>
                    </Link>
                    <h1 className="mt-10 text-3xl font-black tracking-tight text-slate-900">Official Portal</h1>
                </div>

                {/* Login Form */}
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email Address
                            </label>
                            <div className="relative mt-2">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="block w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <div className="relative mt-2">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <LockClosedIcon className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="block w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-slate-600">Don't have an account? </span>
                        <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                            Register here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
