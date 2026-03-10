"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Registration failed");
            }

            // Redirect to verification page
            router.push("/verify");
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
        // Do not set loading to false on success to prevent button flickering before redirect
    };

    return (
        <div className="min-h-screen bg-slate-50 flex selection:bg-indigo-500/30">
            {/* Left Side: Visual / Brand */}
            <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-8 xl:p-12 overflow-hidden border-r border-slate-200/60 bg-white">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50/50 z-0"></div>
                <div className="absolute top-[-10%] right-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500/10 blur-[130px] mix-blend-multiply pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[100px] mix-blend-multiply pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

                <div className="relative z-10 w-full animate-fade-in">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xl shadow-indigo-500/10 transition-transform duration-500 group-hover:scale-105 p-2 ring-1 ring-slate-100 border border-slate-50">
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
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
                        Citizen Portal
                    </div>
                    <h2 className="text-4xl font-heading font-black text-slate-900 leading-[1.2] mb-6">
                        Join the future of <br /> civic engagement.
                    </h2>
                    <p className="text-lg text-slate-500 font-medium max-w-lg">
                        Create an account to report issues instantly, track resolution progress in real-time, and help build a better community.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-slate-400">
                    <span>© {new Date().getFullYear()} SevaSetu</span>
                    <span>•</span>
                    <a href="#" className="hover:text-slate-600 transition-colors">Help Center</a>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto bg-slate-50">
                {/* Mobile Background Elements */}
                <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[100px] mix-blend-multiply pointer-events-none lg:hidden" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none lg:hidden"></div>

                <div className="w-full max-w-md relative z-10 py-12 lg:py-0">
                    <div className="text-center lg:text-left mb-8">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <Link href="/" className="inline-flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xl shadow-indigo-500/10 p-2 ring-1 ring-slate-100 border border-slate-50">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                                        alt="National Emblem of India"
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                            </Link>
                        </div>

                        <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight mb-2">Create Account</h1>
                        <p className="text-slate-500 text-sm">Fill in your details to get started.</p>
                    </div>

                    <div className="rounded-3xl border border-white bg-white/60 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/50">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-medium text-red-600 animate-slide-up">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <UserIcon className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="block w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="block w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <PhoneIcon className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="block w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                            <LockClosedIcon className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="block w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Confirm
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                            <LockClosedIcon className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="block w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-6 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                        Registering...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Create Account <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </span>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm font-medium">
                            <span className="text-slate-500">Already have an account? </span>
                            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 transition-colors underline decoration-indigo-600/30 underline-offset-4 font-bold">
                                Sign in here
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
