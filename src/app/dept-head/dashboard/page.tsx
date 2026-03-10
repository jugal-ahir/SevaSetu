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

export default async function DeptHeadDashboard({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const user = await getCurrentUser();

    if (!user || user.role !== "DEPT_HEAD" || !user.departmentId) {
        redirect("/login");
    }

    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const pageSize = 3;

    // Fetch department stats
    const totalGrievances = await prisma.grievance.count({
        where: { departmentId: user.departmentId },
    });

    const pendingGrievances = await prisma.grievance.count({
        where: {
            departmentId: user.departmentId,
            status: { in: ["SUBMITTED", "ASSIGNED", "IN_PROGRESS"] },
        },
    });

    const escalatedGrievances = await prisma.grievance.count({
        where: {
            departmentId: user.departmentId,
            status: "ESCALATED",
        },
    });

    const resolvedGrievances = await prisma.grievance.count({
        where: {
            departmentId: user.departmentId,
            status: { in: ["RESOLVED", "CLOSED"] },
        },
    });

    // Fetch recent grievances
    const [recentGrievances, totalActivity] = await Promise.all([
        prisma.grievance.findMany({
            where: { departmentId: user.departmentId },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                citizen: { select: { name: true } },
                assignedTo: { select: { name: true } },
                region: { select: { name: true } },
            },
        }),
        prisma.grievance.count({ where: { departmentId: user.departmentId } })
    ]);

    const totalPages = Math.ceil(totalActivity / pageSize);

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500/30">
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[0%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-purple-100/40 blur-[100px]" />
            </div>

            <Navbar userRole="DEPT_HEAD" userName={user.name} />

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in space-y-8">
                <div className="mb-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 mb-2">
                            Department Dashboard
                        </h1>
                        <p className="text-lg text-slate-500 font-medium">
                            Overview of department performance and grievance status
                        </p>
                    </div>
                    <Link
                        href="/dept-head/analytics"
                        className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 hover:shadow-sm"
                    >
                        View Full Analytics
                    </Link>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Grievances"
                        value={totalGrievances}
                        icon={<RectangleStackIcon className="h-6 w-6 text-blue-600" />}
                        gradient="from-blue-50 to-indigo-50"
                        borderColor="border-blue-200"
                        textColor="text-blue-900"
                    />
                    <StatCard
                        title="Pending Review"
                        value={pendingGrievances}
                        icon={<ClockIcon className="h-6 w-6 text-amber-600" />}
                        gradient="from-amber-50 to-orange-50"
                        borderColor="border-amber-200"
                        textColor="text-amber-900"
                    />
                    <StatCard
                        title="Escalated"
                        value={escalatedGrievances}
                        icon={<ExclamationTriangleIcon className={`h-6 w-6 ${escalatedGrievances > 0 ? "text-red-600" : "text-slate-400"}`} />}
                        gradient={escalatedGrievances > 0 ? "from-red-50 to-rose-50" : "from-slate-50 to-gray-50"}
                        borderColor={escalatedGrievances > 0 ? "border-red-200" : "border-slate-200"}
                        textColor={escalatedGrievances > 0 ? "text-red-900" : "text-slate-700"}
                    />
                    <StatCard
                        title="Resolved"
                        value={resolvedGrievances}
                        icon={<CheckCircleIcon className="h-6 w-6 text-emerald-600" />}
                        gradient="from-emerald-50 to-teal-50"
                        borderColor="border-emerald-200"
                        textColor="text-emerald-900"
                    />
                </div>

                <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-slate-900">Recent Activity</h2>
                            <p className="text-sm font-medium text-slate-500 mt-1">Latest grievances in your department</p>
                        </div>
                    </div>

                    {recentGrievances.length === 0 ? (
                        <div className="py-20 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white mb-4 border border-slate-200 shadow-sm">
                                <DocumentTextIcon className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No recent activity</h3>
                            <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">
                                There have been no new grievances received by your department recently.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {recentGrievances.map((grievance) => {
                                const isEscalated = grievance.status === "ESCALATED";

                                return (
                                    <Link
                                        key={grievance.id}
                                        href={`/dept-head/grievances/${grievance.id}`}
                                        className={`group block rounded-2xl border ${isEscalated ? 'border-red-200 bg-red-50/30' : 'border-slate-200/60 bg-white'} p-5 transition-all hover:-translate-y-1 hover:shadow-lg ${isEscalated ? 'hover:border-red-300 hover:shadow-red-500/10' : 'hover:border-blue-300 hover:shadow-blue-500/10'} relative overflow-hidden`}
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-3 mb-2.5">
                                                    <StatusBadge status={grievance.status} />
                                                    <span className="text-xs font-bold text-slate-400">
                                                        #{grievance.id.substring(0, 8).toUpperCase()}
                                                    </span>
                                                </div>

                                                <h3 className={`text-lg font-bold truncate mb-3 transition-colors ${isEscalated ? 'text-red-900 group-hover:text-red-700' : 'text-slate-900 group-hover:text-blue-600'}`}>
                                                    {grievance.title}
                                                </h3>

                                                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                                                    <span className="flex items-center gap-1 mt-0.5">
                                                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        {(grievance as any).citizen.name}
                                                    </span>
                                                    <span className="flex items-center gap-1 mt-0.5">
                                                        <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                                                        {new Date(grievance.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border bg-slate-50 text-slate-600 border-slate-200`}>
                                                        Officer: {(grievance as any).assignedTo?.name || "Unassigned"}
                                                    </span>
                                                    {(grievance as any).region && (
                                                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border bg-blue-50 text-blue-700 border-blue-200`}>
                                                            {(grievance as any).region.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="hidden md:flex flex-col items-end justify-center shrink-0">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors border shadow-sm ${isEscalated ? 'bg-red-50 text-red-500 border-red-100 group-hover:bg-red-100 group-hover:text-red-700 group-hover:border-red-200' : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100'}`}>
                                                    <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                    {recentGrievances.length > 0 && (
                        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Link
                                    href={`/dept-head/dashboard?page=${Math.max(1, page - 1)}`}
                                    className={`flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-bold border transition-all ${page <= 1 ? "pointer-events-none opacity-50 bg-slate-50 text-slate-400 border-slate-200" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"}`}
                                >
                                    Previous
                                </Link>
                                <Link
                                    href={`/dept-head/dashboard?page=${Math.min(totalPages, page + 1)}`}
                                    className={`flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-bold border transition-all ${page >= totalPages ? "pointer-events-none opacity-50 bg-slate-50 text-slate-400 border-slate-200" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"}`}
                                >
                                    Next
                                </Link>
                            </div>
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
