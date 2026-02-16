import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { UserCircleIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

export default async function AdminProfile() {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole={user.role} userName={user.name} />

            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Administrative Profile</h1>
                    <p className="mt-2 text-slate-600">Overview of your system privileges</p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-center">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-blue-600 shadow-lg">
                            <UserCircleIcon className="h-16 w-16" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-white">{user.name}</h2>
                        <p className="text-blue-100">{user.email}</p>
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-100 backdrop-blur-sm">
                            <ShieldCheckIcon className="h-4 w-4" />
                            {user.role}
                        </div>
                    </div>

                    <div className="px-8 py-6">
                        <div className="space-y-6">
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <p className="text-xs font-medium text-slate-500 uppercase">System Role</p>
                                <p className="font-semibold text-slate-900">{user.role.replace(/_/g, " ")}</p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <p className="text-xs font-medium text-slate-500 uppercase">Account Status</p>
                                <p className="font-semibold text-green-600 font-bold">ACTIVE & VERIFIED</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
