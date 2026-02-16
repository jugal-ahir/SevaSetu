import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { UserCircleIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";

export default async function DeptHeadProfile() {
    const user = await getCurrentUser();

    if (!user || user.role !== "DEPT_HEAD") {
        redirect("/login");
    }

    const deptHead = await prisma.user.findUnique({
        where: { id: user.id },
        include: { department: true }
    });

    if (!deptHead) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole="DEPT_HEAD" userName={user.name} />

            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Department Head Profile</h1>
                    <p className="mt-2 text-slate-600">Manage your departmental authority profile</p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-center">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-blue-600 shadow-lg">
                            <UserCircleIcon className="h-16 w-16" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-white">{deptHead.name}</h2>
                        <p className="text-blue-100">{deptHead.email}</p>
                    </div>

                    <div className="px-8 py-6">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                                    <BuildingOfficeIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase">Managing Department</p>
                                    <p className="font-semibold text-slate-900">{deptHead.department?.name || "N/A"}</p>
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <p className="text-xs font-medium text-slate-500 uppercase">Verification Level</p>
                                <p className="font-semibold text-blue-600">DEPARTMENTAL HEAD (LEVEL 2)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
