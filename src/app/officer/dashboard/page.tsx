import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
    DocumentTextIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
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
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole={user.role} userName={user.name} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Officer Dashboard</h1>
                    <p className="mt-2 text-slate-600">Manage your assigned cases</p>
                </div>

                {/* Stats Grid */}
                <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Assigned" value={totalAssigned} color="blue" />
                    <StatCard title="In Progress" value={inProgress} color="amber" />
                    <StatCard title="Resolved" value={resolved} color="green" />
                    <StatCard title="Overdue" value={overdue} color="red" />
                </div>

                {/* Assigned Cases */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-6 text-xl font-bold text-slate-900">Assigned Cases</h2>

                    {assignedGrievances.length === 0 ? (
                        <div className="py-12 text-center">
                            <DocumentTextIcon className="mx-auto h-12 w-12 text-slate-300" />
                            <p className="mt-4 text-sm text-slate-600">No cases assigned yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {assignedGrievances.map((grievance) => (
                                <Link
                                    key={grievance.id}
                                    href={`/officer/cases/${grievance.id}`}
                                    className="block rounded-lg border border-slate-200 p-4 transition-all hover:border-blue-300 hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-900">{grievance.title}</h3>
                                            <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                                                {grievance.description}
                                            </p>
                                            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                                                <span>By: {grievance.citizen.name}</span>
                                                <span>• {grievance.category}</span>
                                                <span>• {new Date(grievance.createdAt).toLocaleDateString()}</span>
                                                {grievance.slaDueAt && (
                                                    <span className={new Date(grievance.slaDueAt) < new Date() ? "text-red-600 font-medium" : ""}>
                                                        • Due: {new Date(grievance.slaDueAt).toLocaleDateString()}
                                                    </span>
                                                )}
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

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
    const colorClasses: Record<string, string> = {
        blue: "from-blue-50 to-blue-100 text-blue-600",
        amber: "from-amber-50 to-amber-100 text-amber-600",
        green: "from-green-50 to-green-100 text-green-600",
        red: "from-red-50 to-red-100 text-red-600",
    };

    return (
        <div className="card-hover rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
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
