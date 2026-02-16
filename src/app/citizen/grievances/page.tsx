import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default async function CitizenGrievancesPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== "CITIZEN") {
        redirect("/login");
    }

    const grievances = await prisma.grievance.findMany({
        where: { citizenId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
            department: true,
            region: true,
            assignedTo: { select: { name: true } },
        },
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole={user.role} userName={user.name} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Grievances</h1>
                        <p className="mt-2 text-slate-600">Track all your submitted grievances</p>
                    </div>
                    <Link
                        href="/citizen/grievances/new"
                        className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
                    >
                        Submit New
                    </Link>
                </div>

                {grievances.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <p className="text-slate-600">No grievances submitted yet</p>
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
                                className="block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-slate-900">{grievance.title}</h3>
                                            <StatusBadge status={grievance.status} />
                                        </div>
                                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                                            {grievance.description}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                                            <span className="font-medium">{grievance.category}</span>
                                            {grievance.department && <span>• {grievance.department.name}</span>}
                                            {grievance.assignedTo && <span>• Assigned to {grievance.assignedTo.name}</span>}
                                            <span>• {new Date(grievance.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
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
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${config.className}`}>
            {config.label}
        </span>
    );
}
