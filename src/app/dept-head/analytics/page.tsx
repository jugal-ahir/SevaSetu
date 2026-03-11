import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import {
    ChartBarIcon,
    PresentationChartLineIcon
} from "@heroicons/react/24/outline";
import KPIStats from "./KPIStats";
import AnalyticsCharts from "./AnalyticsCharts";

export default async function DeptHeadAnalytics() {
    const user = await getCurrentUser();

    if (!user || user.role !== "DEPT_HEAD" || !user.departmentId) {
        redirect("/login");
    }

    // Group by Status
    const statusStats = await prisma.grievance.groupBy({
        by: ["status"],
        where: { departmentId: user.departmentId },
        _count: { id: true },
    });

    // Group by Category
    const categoryStats = await prisma.grievance.groupBy({
        by: ["category"],
        where: { departmentId: user.departmentId },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } }
    });

    // Trend Data (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const trendGrievances = await prisma.grievance.findMany({
        where: {
            departmentId: user.departmentId,
            createdAt: { gte: thirtyDaysAgo }
        },
        select: { createdAt: true }
    });

    const trendMap = trendGrievances.reduce((acc, g) => {
        const date = g.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const trendData = Array.from({ length: 31 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (30 - i));
        const dateStr = d.toISOString().split('T')[0];
        return {
            date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            count: trendMap[dateStr] || 0
        };
    });

    // Resolution Time Logic
    const resolvedGrievances = await prisma.grievance.findMany({
        where: {
            departmentId: user.departmentId,
            status: { in: ["RESOLVED", "CLOSED"] },
            closedAt: { not: null }
        },
        select: { createdAt: true, closedAt: true }
    });

    const totalSeconds = resolvedGrievances.reduce((acc, g) => {
        return acc + (g.closedAt!.getTime() - g.createdAt.getTime()) / 1000;
    }, 0);

    const avgResolutionHours = resolvedGrievances.length > 0 
        ? (totalSeconds / resolvedGrievances.length) / 3600 
        : 0;

    const totalCount = await prisma.grievance.count({ where: { departmentId: user.departmentId } });
    const resolvedCount = statusStats
        .filter(s => ["RESOLVED", "CLOSED"].includes(s.status))
        .reduce((sum, s) => sum + s._count.id, 0);
    const escalatedCount = statusStats.find(s => s.status === "ESCALATED")?._count.id || 0;

    const statusData = statusStats.map(s => ({
        name: s.status.replace('_', ' ').toLowerCase(),
        value: s._count.id,
        color: getStatusHexColor(s.status)
    }));

    const categoryData = categoryStats.map(c => ({
        name: c.category.charAt(0).toUpperCase() + c.category.slice(1).toLowerCase(),
        value: c._count.id
    }));

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-[100px]" />
            </div>

            <Navbar userRole="DEPT_HEAD" userName={user.name} />

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 mb-2 flex items-center gap-3">
                            <ChartBarIcon className="h-10 w-10 text-blue-600" />
                            Performance Insights
                        </h1>
                        <p className="text-lg text-slate-500 font-medium">
                            Real-time departmental oversight and impact metrics.
                        </p>
                    </div>
                </div>

                <KPIStats 
                    total={totalCount}
                    resolved={resolvedCount}
                    avgResolutionTime={avgResolutionHours}
                    escalated={escalatedCount}
                />

                <AnalyticsCharts 
                    trendData={trendData}
                    statusData={statusData}
                    categoryData={categoryData}
                />

                <div className="mt-8 rounded-3xl border border-slate-200/60 bg-white/50 backdrop-blur-xl p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                            <PresentationChartLineIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-heading font-bold text-slate-900">Operational Summary</h3>
                            <p className="text-sm text-slate-500">Key take-aways for departmental management</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 mt-8">
                        <SummaryItem 
                            label="Health Score" 
                            value={totalCount > 0 ? (resolvedCount / totalCount > 0.7 ? "Excellent" : "Needs Attention") : "N/A"}
                            desc="Based on resolution vs incoming volume ratio."
                        />
                        <SummaryItem 
                            label="Risk Factor" 
                            value={escalatedCount > 5 ? "High" : (escalatedCount > 0 ? "Moderate" : "Low")}
                            desc="Critical cases currently awaiting senior resolution."
                        />
                        <SummaryItem 
                            label="Trend Velocity" 
                            value={trendGrievances.length > 20 ? "Increasing" : "Stable"}
                            desc="Growth of incoming reports in the last 30 days."
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

function SummaryItem({ label, value, desc }: { label: string, value: string, desc: string }) {
    return (
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <p className="text-xl font-bold text-slate-900 mb-2">{value}</p>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
        </div>
    );
}

function getStatusHexColor(status: string) {
    switch (status) {
        case "SUBMITTED": return "#3b82f6";
        case "ASSIGNED": return "#6366f1";
        case "IN_PROGRESS": return "#f59e0b";
        case "RESOLVED": return "#10b981";
        case "CLOSED": return "#64748b";
        case "ESCALATED": return "#ef4444";
        default: return "#94a3b8";
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case "SUBMITTED": return "bg-blue-500";
        case "ASSIGNED": return "bg-indigo-500";
        case "IN_PROGRESS": return "bg-amber-500";
        case "RESOLVED": return "bg-emerald-500";
        case "CLOSED": return "bg-slate-500";
        case "ESCALATED": return "bg-red-500";
        default: return "bg-slate-400";
    }
}
