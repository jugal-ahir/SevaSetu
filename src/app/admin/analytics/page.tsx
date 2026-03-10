import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import {
    ChartBarIcon,
    UsersIcon,
    BuildingOfficeIcon,
    ClipboardDocumentCheckIcon,
    ClockIcon,
    ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";

export default async function AdminAnalytics() {
    const user = await getCurrentUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    // Fetch master stats
    const [totalUsers, totalGrievances, totalDepartments, resolvedGrievances] = await Promise.all([
        prisma.user.count(),
        prisma.grievance.count(),
        prisma.department.count(),
        prisma.grievance.count({
            where: { status: { in: ["RESOLVED", "CLOSED"] } }
        })
    ]);

    // Breakdown by Status
    const statusBreakdown = await prisma.grievance.groupBy({
        by: ["status"],
        _count: { id: true },
    });

    // Recent Audit Logs
    const recentLogs = await prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
            actor: { select: { name: true, role: true } }
        }
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-100/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[100px]" />
            </div>

            <Navbar userRole={user.role} userName={user.name} />

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 mb-2">
                        System Analytics
                    </h1>
                    <p className="text-lg text-slate-500 font-medium">
                        Global overview of SevaSetu performance and activity
                    </p>
                </div>

                {/* Master Stats */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <StatCard
                        title="Total Users"
                        value={totalUsers}
                        icon={<UsersIcon className="h-6 w-6 text-blue-600" />}
                        gradient="from-blue-50 to-indigo-50"
                        borderColor="border-blue-200"
                        textColor="text-blue-900"
                    />
                    <StatCard
                        title="Total Grievances"
                        value={totalGrievances}
                        icon={<ClipboardDocumentCheckIcon className="h-6 w-6 text-purple-600" />}
                        gradient="from-purple-50 to-fuchsia-50"
                        borderColor="border-purple-200"
                        textColor="text-purple-900"
                    />
                    <StatCard
                        title="Departments"
                        value={totalDepartments}
                        icon={<BuildingOfficeIcon className="h-6 w-6 text-amber-600" />}
                        gradient="from-amber-50 to-orange-50"
                        borderColor="border-amber-200"
                        textColor="text-amber-900"
                    />
                    <StatCard
                        title="Resolution Rate"
                        value={totalGrievances > 0 ? `${((resolvedGrievances / totalGrievances) * 100).toFixed(1)}%` : "0%"}
                        icon={<ChartBarIcon className="h-6 w-6 text-emerald-600" />}
                        gradient="from-emerald-50 to-teal-50"
                        borderColor="border-emerald-200"
                        textColor="text-emerald-900"
                    />
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Status Chart */}
                    <div className="lg:col-span-1 border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:shadow-lg transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        <h2 className="text-xl font-heading font-bold text-slate-900 mb-6 flex items-center gap-2 relative z-10">
                            <ChartBarIcon className="h-6 w-6 text-blue-500" />
                            Grievance Distribution
                        </h2>

                        <div className="space-y-5 relative z-10">
                            {statusBreakdown.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No data available.</p>
                            ) : (
                                statusBreakdown.map((stat) => {
                                    const percentage = totalGrievances > 0 ? (stat._count.id / totalGrievances) * 100 : 0;
                                    const { color, label } = getStatusConfig(stat.status);

                                    return (
                                        <div key={stat.status} className="group/item">
                                            <div className="flex justify-between items-end mb-1.5">
                                                <span className={`text-sm font-bold ${color.replace('bg-', 'text-').replace('-500', '-700')}`}>{label}</span>
                                                <div className="text-right">
                                                    <span className="text-sm font-black text-slate-900 mr-2">{stat._count.id}</span>
                                                    <span className="text-xs font-bold text-slate-400">{percentage.toFixed(1)}%</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2.5 shadow-inner overflow-hidden flex">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${color} group-hover/item:brightness-110`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Audit Logs */}
                    <div className="lg:col-span-2 border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:shadow-lg transition-all">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50/80 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h2 className="text-xl font-heading font-bold text-slate-900 flex items-center gap-2">
                                <ClockIcon className="h-6 w-6 text-slate-500" />
                                System Activity Log
                            </h2>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Latest Events</span>
                        </div>

                        <div className="relative z-10">
                            <div className="absolute top-0 bottom-0 left-[1.1rem] w-px bg-slate-200/60"></div>
                            <ul className="space-y-6 relative">
                                {recentLogs.length === 0 ? (
                                    <li className="pl-12 py-4">
                                        <p className="text-sm text-slate-500 italic">No activity logged yet.</p>
                                    </li>
                                ) : (
                                    recentLogs.map((log) => (
                                        <li key={log.id} className="relative pl-12 group/log">
                                            <span className="absolute left-0 top-1 h-9 w-9 rounded-full bg-white border-4 border-slate-50 flex items-center justify-center shadow-sm z-10 group-hover/log:scale-110 transition-transform">
                                                <div className={`h-2.5 w-2.5 rounded-full ${getActionColor(log.action)}`}></div>
                                            </span>
                                            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 group-hover/log:bg-white group-hover/log:border-slate-200 transition-all shadow-sm">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                                    <p className="text-sm text-slate-700">
                                                        <span className="font-bold text-slate-900">{log.actor?.name || "System"}</span>
                                                        {" "}
                                                        <span className="text-slate-500">{log.action.replace(/_/g, " ").toLowerCase()}</span>
                                                        {" "}
                                                        <span className="font-bold text-slate-900">{log.entity}</span>
                                                    </p>
                                                    <time className="whitespace-nowrap text-xs font-bold text-slate-400">
                                                        {new Date(log.createdAt).toLocaleString(undefined, {
                                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </time>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, gradient, borderColor, textColor }: { title: string; value: string | number; icon: React.ReactNode; gradient: string; borderColor: string; textColor: string }) {
    return (
        <div className={`rounded-3xl border ${borderColor} bg-gradient-to-br ${gradient} p-6 sm:p-8 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow`}>
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/40 rounded-full blur-2xl group-hover:bg-white/60 transition-colors pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <p className={`text-sm font-bold uppercase tracking-wider ${textColor} opacity-80`}>{title}</p>
                    <div className="p-2 bg-white/60 rounded-xl shadow-sm backdrop-blur-sm">
                        {icon}
                    </div>
                </div>
                <p className={`text-4xl font-heading font-black ${textColor}`}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
            </div>
        </div>
    );
}

function getStatusConfig(status: string) {
    switch (status) {
        case "SUBMITTED": return { color: "bg-blue-500", label: "Submitted" };
        case "ASSIGNED": return { color: "bg-indigo-500", label: "Assigned" };
        case "IN_PROGRESS": return { color: "bg-amber-500", label: "In Progress" };
        case "RESOLVED": return { color: "bg-emerald-500", label: "Resolved" };
        case "CLOSED": return { color: "bg-slate-500", label: "Closed" };
        case "ESCALATED": return { color: "bg-red-500", label: "Escalated" };
        default: return { color: "bg-slate-400", label: status };
    }
}

function getActionColor(action: string) {
    if (action.includes("CREATE")) return "bg-emerald-500";
    if (action.includes("UPDATE") || action.includes("EDIT")) return "bg-blue-500";
    if (action.includes("DELETE") || action.includes("REMOVE")) return "bg-red-500";
    if (action.includes("ASSIGN")) return "bg-indigo-500";
    return "bg-slate-400";
}
