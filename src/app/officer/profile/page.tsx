import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { UserCircleIcon, BuildingOfficeIcon, MapIcon } from "@heroicons/react/24/outline";

export default async function OfficerProfile() {
    const user = await getCurrentUser();

    if (!user || user.role !== "OFFICER") {
        redirect("/login");
    }

    // Fetch full user details including department and region
    const officer = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
            department: true,
            region: true,
            _count: {
                select: { assignedGrievances: true }
            }
        }
    });

    if (!officer) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole="OFFICER" userName={user.name} />

            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                    <p className="mt-2 text-slate-600">View and manage your account details</p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-center">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-blue-600 shadow-lg">
                            <UserCircleIcon className="h-16 w-16" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-white">{officer.name}</h2>
                        <p className="text-blue-100">{officer.email}</p>
                    </div>

                    <div className="px-8 py-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                                        <BuildingOfficeIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase">Department</p>
                                        <p className="font-semibold text-slate-900">{officer.department?.name || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                                        <MapIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase">Region</p>
                                        <p className="font-semibold text-slate-900">{officer.region?.name || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-slate-100 pt-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Overview</h3>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-slate-900">{officer._count.assignedGrievances}</p>
                                    <p className="text-sm text-slate-500">Total Cases</p>
                                </div>
                                {/* Add more stats here if needed */}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
