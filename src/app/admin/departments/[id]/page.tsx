import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import EditDepartmentForm from "./EditDepartmentForm";
import Link from "next/link";
import {
    ChevronLeftIcon,
    BuildingOfficeIcon,
    UsersIcon,
    ClipboardDocumentListIcon,
    TruckIcon,
    MapIcon,
    UserIcon
} from "@heroicons/react/24/outline";

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
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-100/30 blur-[100px]" />
            </div>

            <Navbar userRole={user.role} userName={user.name} />

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="mb-6">
                    <Link href="/admin/departments" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200/60 shadow-sm w-fit">
                        <ChevronLeftIcon className="h-4 w-4" />
                        Back to Departments Matrix
                    </Link>
                </div>

                <div className="mb-8 flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-indigo-100 text-indigo-600 border border-indigo-200 shadow-inner">
                        <BuildingOfficeIcon className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-heading font-black text-slate-900 tracking-tight">
                            {department.name}
                        </h1>
                        <p className="text-lg text-slate-500 font-medium mt-1">
                            Configuration and resource management
                        </p>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Edit Form */}
                        <section className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full pointer-events-none transition-colors"></div>
                            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3 relative z-10">
                                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shadow-sm">
                                    <BuildingOfficeIcon className="h-4 w-4" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">Department Properties</h2>
                            </div>
                            <div className="p-6 sm:p-8 relative z-10">
                                <EditDepartmentForm department={department} potentitialHeads={allUsers} />
                            </div>
                        </section>

                        {/* Roster */}
                        <section className="rounded-3xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shadow-sm">
                                        <UsersIcon className="h-4 w-4" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900">Personnel Roster</h2>
                                </div>
                                <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-lg text-sm font-bold shadow-inner">
                                    {department.officers.length} Active
                                </span>
                            </div>

                            {department.officers.length > 0 ? (
                                <ul className="divide-y divide-slate-100">
                                    {department.officers.map(officer => (
                                        <li key={officer.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 font-bold uppercase shadow-sm">
                                                    {officer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{officer.name}</p>
                                                    <p className="text-sm font-medium text-slate-500">{officer.email}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-1 rounded-lg">
                                                Officer
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                                        <UsersIcon className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="font-bold text-slate-700">No officers assigned yet.</p>
                                    <p className="text-sm text-slate-500 mt-1">Assign officers to this department via User Management.</p>
                                </div>
                            )}
                        </section>
                    </div>

                    <div className="space-y-8">
                        {/* Stats Panel */}
                        <div className="rounded-3xl border border-slate-200/60 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Resource Allocation</h3>

                            <div className="space-y-5">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 hover:bg-white hover:border-amber-200 transition-colors">
                                    <div className="p-3 rounded-xl bg-amber-100 text-amber-600 shadow-inner">
                                        <ClipboardDocumentListIcon className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-0.5">Total Cases</p>
                                        <p className="text-2xl font-black text-amber-900 leading-none">{department._count.grievances}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-white hover:border-emerald-200 transition-colors">
                                    <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 shadow-inner">
                                        <TruckIcon className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Fleet Size</p>
                                        <p className="text-2xl font-black text-emerald-900 leading-none">{department._count.vehicles}</p>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-5 mt-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                                        <UserIcon className="h-3.5 w-3.5" /> Department Leadership
                                    </p>
                                    {department.head ? (
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shadow-inner">
                                                {department.head.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">{department.head.name}</p>
                                                <p className="text-xs text-slate-500 font-medium truncate">{department.head.email}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-center">Unassigned</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Territories */}
                        <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
                                <MapIcon className="h-3.5 w-3.5" /> Covered Territories
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {department.regions.length > 0 ? (
                                    department.regions.map(r => (
                                        <span key={r.id} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold shadow-sm">
                                            {r.name}
                                        </span>
                                    ))
                                ) : (
                                    <div className="w-full p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
                                        <p className="text-slate-500 text-sm font-medium">No specific regions assigned.</p>
                                        <p className="text-xs text-slate-400 mt-1">Global coverage implied.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
