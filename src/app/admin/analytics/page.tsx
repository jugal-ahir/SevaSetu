import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import {
    ChartBarIcon,
    UsersIcon,
    BuildingOfficeIcon,
    ClipboardDocumentCheckIcon
} from "@heroicons/react/24/outline";

export default async function AdminAnalytics() {
    const user = await getCurrentUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    // Fetch master stats
    const totalUsers = await prisma.user.count();
    const totalGrievances = await prisma.grievance.count();
    const totalDepartments = await prisma.department.count();
    const resolvedGrievances = await prisma.grievance.count({
        where: { status: { in: ["RESOLVED", "CLOSED"] } }
    });

    // Breakdown by Status
    const statusBreakdown = await prisma.grievance.groupBy({
        by: ["status"],
        _count: { id: true },
    });

    // Recent Audit Logs
    const recentLogs = await prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
            actor: { select: { name: true, role: true } }
        }
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole={user.role} userName={user.name} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">System Analytics</h1>
                    <p className="mt-2 text-slate-600">Global overview of SevaSetu performance and activity</p>
                </div>

                {/* Master Stats */}
                <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                                <UsersIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase">Total Users</p>
                                <p className="text-2xl font-bold text-slate-900">{totalUsers}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
                                <ClipboardDocumentCheckIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase">Grievances</p>
                                <p className="text-2xl font-bold text-slate-900">{totalGrievances}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-green-100 p-3 text-green-600">
                                <BuildingOfficeIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase">Departments</p>
                                <p className="text-2xl font-bold text-slate-900">{totalDepartments}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-amber-100 p-3 text-amber-600">
                                <ChartBarIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase">Resolution Rate</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {totalGrievances > 0 ? ((resolvedGrievances / totalGrievances) * 100).toFixed(1) : 0}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Status Chart Placeholder */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Grievance Status</h2>
                            <div className="space-y-4">
                                {statusBreakdown.map((stat) => (
                                    <div key={stat.status}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium text-slate-700">{stat.status}</span>
                                            <span className="text-sm font-bold text-slate-900">{stat._count.id}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${(stat._count.id / totalGrievances) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* audit Logs */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Recent System logs</h2>
                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {recentLogs.map((log, logIdx) => (
                                        <li key={log.id}>
                                            <div className="relative pb-8">
                                                {logIdx !== recentLogs.length - 1 ? (
                                                    <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                                                ) : null}
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center ring-8 ring-white">
                                                            <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                                                        </span>
                                                    </div>
                                                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                        <div>
                                                            <p className="text-sm text-slate-500">
                                                                <span className="font-medium text-slate-900">{log.actor?.name || "System"}</span>
                                                                {" "}{log.action.replace(/_/g, " ").toLowerCase()}{" "}
                                                                <span className="font-medium text-slate-900">{log.entity}</span>
                                                            </p>
                                                        </div>
                                                        <div className="whitespace-nowrap text-right text-xs text-slate-500">
                                                            {new Date(log.createdAt).toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
