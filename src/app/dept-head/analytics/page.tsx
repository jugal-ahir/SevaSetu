import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import {
    ChartPieIcon,
    TagIcon,
    MapPinIcon,
    ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";

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
    });

    // Group by Region
    const regionStats = await prisma.grievance.groupBy({
        by: ["regionId"],
        where: { departmentId: user.departmentId },
        _count: { id: true },
    });

    // Fetch region names for mapping
    const regions = await prisma.region.findMany({
        where: { departmentId: user.departmentId },
        select: { id: true, name: true }
    });

    const regionMap = regions.reduce((acc, region) => {
        acc[region.id] = region.name;
        return acc;
    }, {} as Record<string, string>);

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-[100px]" />
            </div>

            <Navbar userRole="DEPT_HEAD" userName={user.name} />

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 mb-2">
                        Department Analytics
                    </h1>
                    <p className="text-lg text-slate-500 font-medium">
                        Deep dive into grievance data and trends
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Status Breakdown */}
                    <div className="rounded-3xl border border-slate-200/60 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                                <ChartPieIcon className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-heading font-bold text-slate-900">By Status</h3>
                        </div>

                        <div className="space-y-3 relative z-10">
                            {statusStats.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No data available.</p>
                            ) : (
                                statusStats.map((stat) => (
                                    <div key={stat.status} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${getStatusColor(stat.status)}`}></span>
                                            <span className="text-sm font-bold text-slate-700 capitalize">{stat.status.replace('_', ' ')}</span>
                                        </div>
                                        <span className="rounded-lg bg-white border border-slate-200 px-3 py-1 text-sm font-black text-slate-900 shadow-sm">
                                            {stat._count.id}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="rounded-3xl border border-slate-200/60 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
                                <TagIcon className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-heading font-bold text-slate-900">By Category</h3>
                        </div>

                        <div className="space-y-3 relative z-10">
                            {categoryStats.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No data available.</p>
                            ) : (
                                categoryStats.map((stat) => (
                                    <div key={stat.category} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors">
                                        <span className="text-sm font-bold text-slate-700 capitalize">{stat.category.toLowerCase()}</span>
                                        <span className="rounded-lg bg-white border border-slate-200 px-3 py-1 text-sm font-black text-slate-900 shadow-sm">
                                            {stat._count.id}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Region Breakdown */}
                    <div className="rounded-3xl border border-slate-200/60 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                                <MapPinIcon className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-heading font-bold text-slate-900">By Region</h3>
                        </div>

                        <div className="space-y-3 relative z-10">
                            {regionStats.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No data available.</p>
                            ) : (
                                regionStats.map((stat) => (
                                    <div key={stat.regionId || "unknown"} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors">
                                        <span className="text-sm font-bold text-slate-700">
                                            {stat.regionId ? (regionMap[stat.regionId] || "Unknown Region") : "Unassigned"}
                                        </span>
                                        <span className="rounded-lg bg-white border border-slate-200 px-3 py-1 text-sm font-black text-slate-900 shadow-sm">
                                            {stat._count.id}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Empty State / Insight hint */}
                <div className="mt-8 rounded-3xl border border-blue-200/60 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8 shadow-sm flex items-center gap-6">
                    <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 border border-blue-100 shadow-sm shrink-0">
                        <ArrowTrendingUpIcon className="h-8 w-8" />
                    </div>
                    <div>
                        <h4 className="text-lg font-heading font-bold text-slate-900 mb-1">More Insights Coming Soon</h4>
                        <p className="text-sm font-medium text-slate-600">
                            We are working on adding comprehensive charts, timeline analysis, and resolution time tracking to give you a clearer picture of your department's performance.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
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
