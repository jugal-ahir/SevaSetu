import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import EditDepartmentForm from "./EditDepartmentForm";

interface DepartmentDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function DepartmentDetailsPage({ params }: DepartmentDetailsPageProps) {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    const department = await prisma.department.findUnique({
        where: { id },
        include: {
            head: true,
            regions: true,
            officers: true,
            _count: {
                select: {
                    grievances: true,
                    vehicles: true,
                },
            },
        },
    });

    if (!department) {
        notFound();
    }

    const allUsers = await prisma.user.findMany({
        where: { role: { in: ["OFFICER", "DEPT_HEAD"] } },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole={user.role} userName={user.name} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Manage Department</h1>
                    <p className="mt-2 text-slate-600">Update details and view resources for {department.name}</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Details & Edit Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Department Details</h2>
                            <EditDepartmentForm department={department} potentitialHeads={allUsers} />
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Assigned Officers ({department.officers.length})</h2>
                            {department.officers.length > 0 ? (
                                <ul className="divide-y divide-slate-100">
                                    {department.officers.map(officer => (
                                        <li key={officer.id} className="py-3 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-slate-900">{officer.name}</p>
                                                <p className="text-sm text-slate-500">{officer.email}</p>
                                            </div>
                                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">Officer</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-500 italic">No officers assigned directly to this department.</p>
                            )}
                        </section>
                    </div>

                    {/* Stats Sidebar */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="text-blue-700 font-medium">Total Grievances</span>
                                    <span className="text-2xl font-bold text-blue-800">{department._count.grievances}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                                    <span className="text-indigo-700 font-medium">Active Vehicles</span>
                                    <span className="text-2xl font-bold text-indigo-800">{department._count.vehicles}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                                    <span className="text-emerald-700 font-medium">Head of Dept</span>
                                    <span className="text-sm font-bold text-emerald-800 truncate max-w-[120px]">
                                        {department.head?.name || "Unassigned"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4">Covered Regions</h3>
                            <div className="flex flex-wrap gap-2">
                                {department.regions.length > 0 ? (
                                    department.regions.map(r => (
                                        <span key={r.id} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                                            {r.name}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-slate-500 text-sm">No specific regions assigned.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
