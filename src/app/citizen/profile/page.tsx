import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { UserCircleIcon, PhoneIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";

export default async function CitizenProfile() {
    const user = await getCurrentUser();

    if (!user || user.role !== "CITIZEN") {
        redirect("/login");
    }

    const citizen = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
            _count: {
                select: { grievances: true }
            }
        }
    });

    if (!citizen) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole="CITIZEN" userName={user.name} />

            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                    <p className="mt-2 text-slate-600">Manage your personal information</p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-center">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-blue-600 shadow-lg">
                            <UserCircleIcon className="h-16 w-16" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-white">{citizen.name}</h2>
                        <p className="text-blue-100">{citizen.email}</p>
                        {citizen.isVerified && (
                            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-100 backdrop-blur-sm">
                                <CheckBadgeIcon className="h-4 w-4" />
                                Verified Citizen
                            </div>
                        )}
                    </div>

                    <div className="px-8 py-6">
                        <div className="grid gap-6 sm:grid-cols-1">
                            {citizen.phone && (
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                                            <PhoneIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 uppercase">Phone Number</p>
                                            <p className="font-semibold text-slate-900">{citizen.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase">Total Grievances Submitted</p>
                                        <p className="text-2xl font-bold text-slate-900">{citizen._count.grievances}</p>
                                    </div>
                                    <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                                        <UserCircleIcon className="h-8 w-8" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
