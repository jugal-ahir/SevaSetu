"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { UserCircleIcon, BuildingOfficeIcon, MapIcon, ShieldCheckIcon, KeyIcon } from "@heroicons/react/24/outline";
import ChangePasswordModal from "@/components/ChangePasswordModal";

export default function OfficerProfile() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [toggling2FA, setToggling2FA] = useState(false);

    useEffect(() => {
        async function fetchUser() {
            try {
                // We use a custom endpoint to get full officer details
                const res = await fetch(`/api/auth/me?full=true&t=${Date.now()}`);
                if (!res.ok) {
                    router.push("/login");
                    return;
                }
                const data = await res.json();
                if (data.role !== "OFFICER") {
                    router.push("/login");
                    return;
                }
                setUser(data);
            } catch (err) {
                router.push("/login");
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [router]);

    const handleToggle2FA = async () => {
        if (!user || toggling2FA) return;
        setToggling2FA(true);
        try {
            const res = await fetch("/api/auth/2fa/toggle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: !user.twoFactorEnabled }),
            });
            if (res.ok) {
                setUser({ ...user, twoFactorEnabled: !user.twoFactorEnabled });
            }
        } catch (err) {
            console.error("Toggle 2FA error:", err);
        } finally {
            setToggling2FA(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );
    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole="OFFICER" userName={user.name} />

            <main className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 mb-2">
                        Officer Identity
                    </h1>
                    <p className="text-lg text-slate-500 font-medium">
                        Personal profile and departmental clearance levels
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* ID Card */}
                    <div className="md:col-span-1">
                        <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm overflow-hidden relative group">
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-600 to-indigo-600">
                                <div className="absolute inset-0 bg-white/10 opacity-50 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                            </div>

                            <div className="px-6 pb-8 pt-16 text-center relative z-10">
                                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-white text-blue-600 shadow-xl border-4 border-white relative group-hover:scale-105 transition-transform duration-500">
                                    <UserCircleIcon className="h-24 w-24 text-slate-300" />
                                    <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white"></div>
                                </div>

                                <h2 className="mt-5 text-2xl font-heading font-black text-slate-900">{user.name}</h2>
                                <p className="text-sm font-medium text-slate-500 mb-4">{user.email}</p>

                                <div className="inline-flex flex-col gap-2 w-full">
                                    <div className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 border border-blue-100 px-4 py-2 mt-2 w-full">
                                        <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
                                        <span className="text-xs font-black uppercase tracking-widest text-blue-700">
                                            {user.role}
                                        </span>
                                    </div>
                                    <div className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2 w-full">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                                            Active Service
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm p-6 sm:p-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <BuildingOfficeIcon className="h-5 w-5 text-slate-400" />
                                Professional Details
                            </h3>

                            <div className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="group">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Department</p>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <BuildingOfficeIcon className="h-5 w-5" />
                                            </div>
                                            <p className="font-bold text-slate-900">{user.department?.name || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="group">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Assigned Region</p>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                                <MapIcon className="h-5 w-5" />
                                            </div>
                                            <p className="font-bold text-slate-900">{user.region?.name || "Global"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Cases Assigned</p>
                                            <p className="text-3xl font-black text-slate-900">{user._count?.assignedGrievances || 0}</p>
                                        </div>
                                        <div className="p-3 rounded-2xl bg-slate-100 text-slate-400">
                                            <ShieldCheckIcon className="h-8 w-8" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm p-6 sm:p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full pointer-events-none"></div>
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 relative z-10">
                                <ShieldCheckIcon className="h-5 w-5 text-slate-400" />
                                Security Settings
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                                <button
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
                                >
                                    Change Password
                                </button>
                                <button
                                    onClick={handleToggle2FA}
                                    disabled={toggling2FA}
                                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 ${user.twoFactorEnabled
                                        ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                                        : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"}`}
                                >
                                    {toggling2FA ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        user.twoFactorEnabled ? "Disable 2FA Security" : "Enable 2FA Security"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </div>
    );
}
