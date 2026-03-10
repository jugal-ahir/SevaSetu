import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
    BuildingOfficeIcon,
    UserIcon,
    ShieldCheckIcon,
    TruckIcon,
    DocumentTextIcon,
    PlusIcon,
    ArrowRightIcon
} from "@heroicons/react/24/outline";

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
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[0%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-[100px]" />
            </div>

            <Navbar userRole={user.role} userName={user.name} />

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 mb-2">
                            Departments
                        </h1>
                        <p className="text-lg text-slate-500 font-medium">
                            Manage operational units and their allocated resources
                        </p>
                    </div>
                    <Link
                        href="/admin/departments/new"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Create Department
                    </Link>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {departments.map((dept) => (
                        <Link
                            key={dept.id}
                            href={`/admin/departments/${dept.id}`}
                            className="group block rounded-3xl border border-slate-200/60 bg-white p-6 sm:p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-blue-300 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-inner group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                        <BuildingOfficeIcon className="h-6 w-6" />
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-slate-50 text-slate-400 border border-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                                        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-heading font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{dept.name}</h3>
                                {dept.description && (
                                    <p className="mt-2 text-sm text-slate-500 font-medium line-clamp-2">{dept.description}</p>
                                )}

                                {dept.head ? (
                                    <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-center gap-3">
                                        <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-inner">
                                            {dept.head.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Department Head</p>
                                            <p className="text-sm font-bold text-slate-900 truncate">{dept.head.name}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-6 rounded-2xl bg-amber-50/50 border border-amber-100 border-dashed p-4 flex items-center gap-3">
                                        <div className="h-10 w-10 shrink-0 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center">
                                            <ShieldCheckIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-0.5">No Head Assigned</p>
                                            <p className="text-sm font-medium text-amber-700">Needs attention</p>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-6">
                                    <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-colors">
                                        <UserIcon className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                                        <p className="text-xs font-bold text-slate-500 uppercase">Staff</p>
                                        <p className="text-lg font-black text-slate-900">{dept._count.officers}</p>
                                    </div>
                                    <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-colors">
                                        <DocumentTextIcon className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                                        <p className="text-xs font-bold text-slate-500 uppercase">Cases</p>
                                        <p className="text-lg font-black text-slate-900">{dept._count.grievances}</p>
                                    </div>
                                    <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-colors">
                                        <TruckIcon className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                                        <p className="text-xs font-bold text-slate-500 uppercase">Fleet</p>
                                        <p className="text-lg font-black text-slate-900">{dept._count.vehicles}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {departments.length === 0 && (
                        <div className="col-span-full py-20 rounded-3xl border border-dashed border-slate-300 bg-white/50 backdrop-blur-sm text-center shadow-sm">
                            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-6 shadow-sm border border-slate-200">
                                <BuildingOfficeIcon className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-heading font-bold text-slate-900 mb-2">No Departments Yet</h3>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto mb-6">
                                Operational units are required to route grievances and assign personnel.
                            </p>
                            <Link
                                href="/admin/departments/new"
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-600 border border-slate-200 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
                            >
                                <PlusIcon className="h-5 w-5" />
                                Create your first department
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
