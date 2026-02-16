import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { UserIcon, PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

export default async function DeptHeadTeam() {
    const user = await getCurrentUser();

    if (!user || user.role !== "DEPT_HEAD" || !user.departmentId) {
        redirect("/login");
    }

    const officers = await prisma.user.findMany({
        where: {
            departmentId: user.departmentId,
            role: "OFFICER",
        },
        include: {
            _count: {
                select: { assignedGrievances: { where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } } } }
            },
            region: true,
        },
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole="DEPT_HEAD" userName={user.name} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Team Management</h1>
                    <p className="mt-2 text-slate-600">View and manage officers in your department</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {officers.map((officer) => (
                        <div key={officer.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <UserIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{officer.name}</h3>
                                    <p className="text-xs text-slate-500 uppercase">{officer.role}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6 flex-1">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <EnvelopeIcon className="h-4 w-4" />
                                    {officer.email}
                                </div>
                                {officer.phone && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <PhoneIcon className="h-4 w-4" />
                                        {officer.phone}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="font-medium">Region:</span>
                                    {officer.region?.name || "Unassigned"}
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4 mt-auto">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">Active Cases</span>
                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                                        {officer._count.assignedGrievances}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {officers.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
                            <UserIcon className="mx-auto h-12 w-12 text-slate-300" />
                            <p className="mt-2 text-slate-500">No officers found in this department.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
