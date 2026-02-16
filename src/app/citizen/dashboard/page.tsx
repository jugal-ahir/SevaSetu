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
    PlusCircleIcon
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
            status: { in: ["SUBMITTED", "ASSIGNED", "IN_PROGRESS"] },
        },
    });

    const resolvedGrievances = await prisma.grievance.count({
        where: {
            citizenId: user.id,
            status: { in: ["RESOLVED", "CLOSED"] },
        },
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole={user.role} userName={user.name} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name}!</h1>
                    <p className="mt-2 text-slate-600">Manage your grievances and track municipal services</p>
                </div>

                {/* Stats Grid */}
                <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Grievances"
                        value={totalGrievances}
                        icon={<DocumentTextIcon className="h-6 w-6" />}
                        color="blue"
                    />
                    <StatCard
                        title="Pending"
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
                        value={totalGrievances > 0 ? `${Math.round((resolvedGrievances / totalGrievances) * 100)}%` : "0%"}
                        icon={<ExclamationTriangleIcon className="h-6 w-6" />}
                        color="indigo"
                    />
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <Link
                        href="/citizen/grievances/new"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40"
                    >
                        <PlusCircleIcon className="h-5 w-5" />
                        Submit New Grievance
                    </Link>
                </div>

                {/* Recent Grievances */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Recent Grievances</h2>
                        <Link
                            href="/citizen/grievances"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            View All
                        </Link>
                    </div>

                    {grievances.length === 0 ? (
                        <div className="py-12 text-center">
                            <DocumentTextIcon className="mx-auto h-12 w-12 text-slate-300" />
                            <p className="mt-4 text-sm text-slate-600">No grievances yet</p>
                            <Link
                                href="/citizen/grievances/new"
                                className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                Submit your first grievance
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {grievances.map((grievance) => (
                                <Link
                                    key={grievance.id}
                                    href={`/citizen/grievances/${grievance.id}`}
                                    className="block rounded-lg border border-slate-200 p-4 transition-all hover:border-blue-300 hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-900">{grievance.title}</h3>
                                            <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                                                {grievance.description}
                                            </p>
                                            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                                                <span>{grievance.category}</span>
                                                {grievance.department && <span>• {grievance.department.name}</span>}
                                                <span>• {new Date(grievance.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <StatusBadge status={grievance.status} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
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
        blue: "from-blue-50 to-blue-100 text-blue-600",
        amber: "from-amber-50 to-amber-100 text-amber-600",
        green: "from-green-50 to-green-100 text-green-600",
        indigo: "from-indigo-50 to-indigo-100 text-indigo-600",
    };

    return (
        <div className="card-hover rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-600">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                </div>
                <div className={`rounded-xl bg-gradient-to-br p-3 ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; className: string }> = {
        SUBMITTED: { label: "Submitted", className: "bg-blue-100 text-blue-700" },
        ASSIGNED: { label: "Assigned", className: "bg-purple-100 text-purple-700" },
        IN_PROGRESS: { label: "In Progress", className: "bg-amber-100 text-amber-700" },
        RESOLVED: { label: "Resolved", className: "bg-green-100 text-green-700" },
        CLOSED: { label: "Closed", className: "bg-slate-100 text-slate-700" },
        ESCALATED: { label: "Escalated", className: "bg-red-100 text-red-700" },
    };

    const config = statusConfig[status] || statusConfig.SUBMITTED;

    return (
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${config.className}`}>
            {config.label}
        </span>
    );
}
