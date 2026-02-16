import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default async function AdminDepartmentsPage() {
    const user = await getCurrentUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    const departments = await prisma.department.findMany({
        orderBy: { name: "asc" },
        include: {
            head: { select: { name: true, email: true } },
            _count: {
                select: {
                    officers: true,
                    grievances: true,
                    vehicles: true,
                },
            },
        },
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole={user.role} userName={user.name} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Department Management</h1>
                        <p className="mt-2 text-slate-600">Manage all departments and their resources</p>
                    </div>
                    <Link
                        href="/admin/departments/new"
                        className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
                    >
                        Add Department
                    </Link>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {departments.map((dept) => (
                        <Link
                            key={dept.id}
                            href={`/admin/departments/${dept.id}`}
                            className="card-hover rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <h3 className="text-lg font-bold text-slate-900">{dept.name}</h3>
                            {dept.description && (
                                <p className="mt-2 text-sm text-slate-600 line-clamp-2">{dept.description}</p>
                            )}

                            {dept.head && (
                                <div className="mt-4 rounded-lg bg-slate-50 p-3">
                                    <p className="text-xs text-slate-500">Department Head</p>
                                    <p className="text-sm font-medium text-slate-900">{dept.head.name}</p>
                                </div>
                            )}

                            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-slate-200 pt-4">
                                <div>
                                    <p className="text-xs text-slate-500">Officers</p>
                                    <p className="text-lg font-bold text-slate-900">{dept._count.officers}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Cases</p>
                                    <p className="text-lg font-bold text-slate-900">{dept._count.grievances}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Vehicles</p>
                                    <p className="text-lg font-bold text-slate-900">{dept._count.vehicles}</p>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {departments.length === 0 && (
                        <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                            <p className="text-slate-600">No departments created yet</p>
                            <Link
                                href="/admin/departments/new"
                                className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                Create your first department
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
