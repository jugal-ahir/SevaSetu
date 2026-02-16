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
    UserGroupIcon
} from "@heroicons/react/24/outline";

export default async function DeptHeadDashboard() {
    const user = await getCurrentUser();

    if (!user || user.role !== "DEPT_HEAD" || !user.departmentId) {
        redirect("/login");
    }

    // Unawaiting params - this is a page component, params are not used here but if they were
    // they would need to be awaited. Since this is the root dashboard, we don't need params.

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
    const recentGrievances = await prisma.grievance.findMany({
        where: { departmentId: user.departmentId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
            citizen: { select: { name: true } },
            assignedTo: { select: { name: true } },
            region: { select: { name: true } },
        },
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole="DEPT_HEAD" userName={user.name} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Department Dashboard</h1>
                    <p className="mt-2 text-slate-600">Overview of department performance and grievance status</p>
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
                        title="Pending Review"
                        value={pendingGrievances}
                        icon={<ClockIcon className="h-6 w-6" />}
                        color="amber"
                    />
                    <StatCard
                        title="Escalated"
                        value={escalatedGrievances}
                        icon={<ExclamationTriangleIcon className="h-6 w-6" />}
                        color="red"
                    />
                    <StatCard
                        title="Resolved"
                        value={resolvedGrievances}
                        icon={<CheckCircleIcon className="h-6 w-6" />}
                        color="green"
                    />
                </div>

                {/* Recent Grievances */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
                        <Link
                            href="/dept-head/analytics"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            View Analytics
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-500">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-700">
                                <tr>
                                    <th className="px-6 py-3">Title</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Assigned To</th>
                                    <th className="px-6 py-3">Region</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentGrievances.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center">
                                            No grievances found
                                        </td>
                                    </tr>
                                ) : (
                                    recentGrievances.map((grievance) => (
                                        <tr key={grievance.id} className="border-b bg-white hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {grievance.title}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={grievance.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                {grievance.assignedTo?.name || "Unassigned"}
                                            </td>
                                            <td className="px-6 py-4">
                                                {grievance.region?.name || "N/A"}
                                            </td>
                                            <td className="px-6 py-4">
                                                {new Date(grievance.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/dept-head/grievances/${grievance.id}`}
                                                    className="font-medium text-blue-600 hover:underline"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
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
    color: "blue" | "amber" | "green" | "red";
}) {
    const colorClasses = {
        blue: "from-blue-50 to-blue-100 text-blue-600",
        amber: "from-amber-50 to-amber-100 text-amber-600",
        green: "from-green-50 to-green-100 text-green-600",
        red: "from-red-50 to-red-100 text-red-600",
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
