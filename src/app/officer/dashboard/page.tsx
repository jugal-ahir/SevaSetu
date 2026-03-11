import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
    DocumentTextIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowRightIcon,
    RectangleStackIcon
} from "@heroicons/react/24/outline";

export default async function OfficerDashboard() {
    const user = await getCurrentUser();

    if (!user || user.role !== "OFFICER") {
        redirect("/login");
    }

    // Fetch assigned grievances
    const assignedGrievances = await prisma.grievance.findMany({
        where: { assignedToId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
            citizen: { select: { name: true, email: true } },
            department: true,
            region: true,
        },
    });

    // Calculate stats
    const totalAssigned = await prisma.grievance.count({
        where: { assignedToId: user.id },
    });

    const inProgress = await prisma.grievance.count({
        where: {
            assignedToId: user.id,
            status: "IN_PROGRESS",
        },
    });

    const resolved = await prisma.grievance.count({
        where: {
            assignedToId: user.id,
            status: { in: ["RESOLVED", "CLOSED"] },
        },
    });

    const overdue = await prisma.grievance.count({
        where: {
            assignedToId: user.id,
            slaDueAt: { lt: new Date() },
            status: { notIn: ["RESOLVED", "CLOSED"] },
        },
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[0%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-purple-100/40 blur-[100px]" />
            </div>

            <Navbar userRole={user.role} userName={user.name} />

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in space-y-8">
                <div className="mb-2">
                    <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 mb-2">
                        Officer Dashboard
                    </h1>
                    <p className="text-lg text-slate-500 font-medium">
                        Welcome back, {user.name}. Here is an overview of your assigned cases.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Assigned"
                        value={totalAssigned}
                        icon={<RectangleStackIcon className="h-6 w-6 text-blue-600" />}
                        gradient="from-blue-50 to-indigo-50"
                        borderColor="border-blue-200"
                        textColor="text-blue-900"
                    />
                    <StatCard
                        title="In Progress"
                        value={inProgress}
                        icon={<ClockIcon className="h-6 w-6 text-amber-600" />}
                        gradient="from-amber-50 to-orange-50"
                        borderColor="border-amber-200"
                        textColor="text-amber-900"
                    />
                    <StatCard
                        title="Resolved"
                        value={resolved}
                        icon={<CheckCircleIcon className="h-6 w-6 text-emerald-600" />}
                        gradient="from-emerald-50 to-teal-50"
                        borderColor="border-emerald-200"
                        textColor="text-emerald-900"
                    />
                    <StatCard
                        title="Overdue SLAs"
                        value={overdue}
                        icon={<ExclamationTriangleIcon className={`h-6 w-6 ${overdue > 0 ? "text-red-600" : "text-slate-400"}`} />}
                        gradient={overdue > 0 ? "from-red-50 to-rose-50" : "from-slate-50 to-gray-50"}
                        borderColor={overdue > 0 ? "border-red-200" : "border-slate-200"}
                        textColor={overdue > 0 ? "text-red-900" : "text-slate-700"}
                    />
                </div>

                {/* Assigned Cases */}
                <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-slate-900">Recent Assignments</h2>
                            <p className="text-sm font-medium text-slate-500 mt-1">Latest 10 cases requiring your attention</p>
                        </div>
                        <Link
                            href="/officer/cases"
                            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-white hover:shadow-sm"
                        >
                            View All Cases
                        </Link>
                    </div>

                    {assignedGrievances.length === 0 ? (
                        <div className="py-20 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white mb-4 border border-slate-200 shadow-sm">
                                <DocumentTextIcon className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No cases assigned yet</h3>
                            <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">
                                You currently have no pending grievances in your queue.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {assignedGrievances.map((grievance) => {
                                const isOverdue = grievance.slaDueAt && new Date(grievance.slaDueAt) < new Date() && !["RESOLVED", "CLOSED"].includes(grievance.status);

                                return (
                                    <Link
                                        key={grievance.id}
                                        href={`/officer/grievances/${grievance.id}`}
                                        className={`group block rounded-2xl border ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-slate-200/60 bg-white'} p-5 transition-all hover:-translate-y-1 hover:shadow-lg ${isOverdue ? 'hover:border-red-300 hover:shadow-red-500/10' : 'hover:border-blue-300 hover:shadow-blue-500/10'} relative overflow-hidden`}
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-3 mb-2.5">
                                                    <StatusBadge status={grievance.status} />
                                                    <span className="text-xs font-bold text-slate-400">
                                                        #{grievance.id.substring(0, 8).toUpperCase()}
                                                    </span>
                                                    {isOverdue && (
                                                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-700 uppercase tracking-wider animate-pulse">
                                                            <ExclamationTriangleIcon className="h-3 w-3" />
                                                            SLA Breach
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className={`text-lg font-bold truncate mb-1 transition-colors ${isOverdue ? 'text-red-900 group-hover:text-red-700' : 'text-slate-900 group-hover:text-blue-600'}`}>
                                                    {grievance.title}
                                                </h3>

                                                <p className="text-sm text-slate-600 line-clamp-1 mb-3 pr-4">
                                                    {grievance.description}
                                                </p>

                                                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100/80 border border-slate-200/60">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                        {grievance.category}
                                                    </span>
                                                    <span className="flex items-center gap-1 mt-0.5">
                                                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        {grievance.citizen.name}
                                                    </span>
                                                    <span className="flex items-center gap-1 mt-0.5">
                                                        <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                                                        {new Date(grievance.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                    {grievance.slaDueAt && (
                                                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${isOverdue ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                                                            Due: {new Date(grievance.slaDueAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="hidden md:flex flex-col items-end justify-center shrink-0">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors border shadow-sm ${isOverdue ? 'bg-red-50 text-red-500 border-red-100 group-hover:bg-red-100 group-hover:text-red-700 group-hover:border-red-200' : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100'}`}>
                                                    <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}

                    {assignedGrievances.length > 0 && (
                        <div className="mt-6 sm:hidden">
                            <Link
                                href="/officer/cases"
                                className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"
                            >
                                View All Cases
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, gradient, borderColor, textColor }: { title: string; value: number; icon: React.ReactNode; gradient: string; borderColor: string; textColor: string }) {
    return (
        <div className={`rounded-3xl border ${borderColor} bg-gradient-to-br ${gradient} p-6 sm:p-8 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow`}>
            {/* Background design elements */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/40 rounded-full blur-2xl group-hover:bg-white/60 transition-colors pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <p className={`text-sm font-bold uppercase tracking-wider ${textColor} opacity-80`}>{title}</p>
                    <div className="p-2 bg-white/60 rounded-xl shadow-sm backdrop-blur-sm">
                        {icon}
                    </div>
                </div>
                <p className={`text-4xl font-heading font-black ${textColor}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; className: string }> = {
        SUBMITTED: { label: "Submitted", className: "bg-blue-50 text-blue-700 ring-blue-600/20" },
        ASSIGNED: { label: "Assigned", className: "bg-indigo-50 text-indigo-700 ring-indigo-600/20" },
        IN_PROGRESS: { label: "In Progress", className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
        RESOLVED: { label: "Resolved", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
        CLOSED: { label: "Closed", className: "bg-slate-100 text-slate-700 ring-slate-400/20" },
        ESCALATED: { label: "Escalated", className: "bg-red-50 text-red-700 ring-red-600/20" },
    };

    const config = statusConfig[status] || statusConfig.SUBMITTED;

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${config.className}`}>
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${config.className.split(' ')[1].replace('text', 'bg')}`}></span>
            {config.label}
        </span>
    );
}
