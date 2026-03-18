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
    PlusCircleIcon,
    ArrowRightIcon
} from "@heroicons/react/24/outline";

export default async function CitizenDashboard() {
    const user = await getCurrentUser();

    if (!user || user.role !== "CITIZEN") {
        redirect("/login");
    }

    // Fetch user's grievances
    const grievances = await prisma.grievance.findMany({
        where: { citizenId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
            department: true,
            region: true,
        },
    });

    // Calculate stats
    const totalGrievances = await prisma.grievance.count({
        where: { citizenId: user.id },
    });

    const pendingGrievances = await prisma.grievance.count({
        where: {
            citizenId: user.id,
            status: { in: ["SUBMITTED", "ASSIGNED", "IN_PROGRESS", "ESCALATED"] },
        },
    });

    const resolvedGrievances = await prisma.grievance.count({
        where: {
            citizenId: user.id,
            status: { in: ["RESOLVED", "CLOSED"] },
        },
    });

    const successRate = totalGrievances > 0 ? Math.round((resolvedGrievances / totalGrievances) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[100px]" />
            </div>

            <Navbar userRole={user.role} userName={user.name} />

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                {/* Header Section */}
                <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-slate-900 mb-2">
                            Welcome back, {user.name}
                        </h1>
                        <p className="text-base sm:text-lg text-slate-500 font-medium">
                            Manage your grievances and track municipal services efficiently.
                        </p>
                    </div>

                    {/* Primary Call to Action */}
                    <Link
                        href="/citizen/grievances/new"
                        className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 sm:py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105 hover:shadow-blue-500/40 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                        <span className="relative flex items-center gap-2">
                            <PlusCircleIcon className="h-5 w-5" />
                            Report Grievance
                        </span>
                    </Link>
                </div>

                {/* Bento Grid Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        title="Total Grievances"
                        value={totalGrievances}
                        icon={<DocumentTextIcon className="h-6 w-6" />}
                        color="blue"
                    />
                    <StatCard
                        title="Active & Pending"
                        value={pendingGrievances}
                        icon={<ClockIcon className="h-6 w-6" />}
                        color="amber"
                    />
                    <StatCard
                        title="Resolved"
                        value={resolvedGrievances}
                        icon={<CheckCircleIcon className="h-6 w-6" />}
                        color="green"
                    />
                    <StatCard
                        title="Success Rate"
                        value={`${successRate}%`}
                        icon={<ExclamationTriangleIcon className="h-6 w-6" />}
                        color="indigo"
                    />
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Recent Grievances (Takes up 2/3) */}
                    <div className="lg:col-span-2">
                        <div className="rounded-3xl border border-slate-200/60 bg-white shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-heading font-bold text-slate-900">Recent Grievances</h2>
                                <Link
                                    href="/citizen/grievances"
                                    className="group flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    View All <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>

                            {grievances.length === 0 ? (
                                <div className="py-16 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                                        <DocumentTextIcon className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">No grievances reported</h3>
                                    <p className="max-w-sm mx-auto text-sm text-slate-500 mb-6">
                                        You haven&apos;t reported any issues yet. If you face any civic problems, feel free to report them here.
                                    </p>
                                    <Link
                                        href="/citizen/grievances/new"
                                        className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        Submit your first grievance <ArrowRightIcon className="h-4 w-4" />
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {grievances.map((grievance) => (
                                        <Link
                                            key={grievance.id}
                                            href={`/citizen/grievances/${grievance.id}`}
                                            className="group block rounded-2xl border border-slate-200/60 bg-slate-50/50 p-5 transition-all hover:bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                            {grievance.title}
                                                        </h3>
                                                        <StatusBadge status={grievance.status} />
                                                    </div>
                                                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                                                        {grievance.description}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 border border-slate-200 shadow-sm">
                                                            {grievance.category}
                                                        </span>
                                                        {grievance.department && (
                                                            <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 border border-slate-200 shadow-sm">
                                                                {grievance.department.name}
                                                            </span>
                                                        )}
                                                        <span className="text-slate-400">
                                                            {new Date(grievance.createdAt).toLocaleDateString(undefined, {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="hidden sm:flex self-center w-8 h-8 rounded-full bg-slate-100 items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                    <ArrowRightIcon className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Information/Help */}
                    <div className="space-y-8">
                        {/* Info Card */}
                        <div className="rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/30 blur-[60px]" />
                            <div className="relative z-10">
                                <h3 className="text-xl font-heading font-bold mb-4">How it works</h3>
                                <ul className="space-y-4 text-sm text-indigo-100 font-medium">
                                    <li className="flex items-start gap-3">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/40 text-xs font-bold ring-1 ring-indigo-400/50">1</div>
                                        <span>Submit your grievance with relevant details and location.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/40 text-xs font-bold ring-1 ring-indigo-400/50">2</div>
                                        <span>The system routes it to the correct department automatically.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/40 text-xs font-bold ring-1 ring-indigo-400/50">3</div>
                                        <span>Track real-time updates and resolution progress directly from your dashboard.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    color,
}: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: "blue" | "amber" | "green" | "indigo";
}) {
    const colorClasses = {
        blue: "from-blue-500 to-blue-600 shadow-blue-500/20 text-blue-50",
        amber: "from-amber-500 to-orange-500 shadow-orange-500/20 text-orange-50",
        green: "from-emerald-500 to-green-600 shadow-green-500/20 text-green-50",
        indigo: "from-indigo-500 to-purple-600 shadow-indigo-500/20 text-indigo-50",
    };

    const textColors = {
        blue: "text-blue-600",
        amber: "text-amber-600",
        green: "text-emerald-600",
        indigo: "text-indigo-600",
    }

    return (
        <div className="group rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all hover:-translate-y-1 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClasses[color]} opacity-5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:opacity-10 transition-opacity`}></div>
            <div className="flex flex-col justify-between h-full relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}>
                        {icon}
                    </div>
                </div>
                <div>
                    <h3 className="text-4xl font-heading font-black tracking-tight text-slate-900 mb-1">
                        {value}
                    </h3>
                    <p className={`text-sm font-bold uppercase tracking-widest ${textColors[color]} opacity-90`}>
                        {title}
                    </p>
                </div>
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
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${config.className}`}>
            {config.label}
        </span>
    );
}
