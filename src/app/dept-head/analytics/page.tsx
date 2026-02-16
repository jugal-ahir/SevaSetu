import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";

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
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole="DEPT_HEAD" userName={user.name} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Department Analytics</h1>
                    <p className="mt-2 text-slate-600">Deep dive into grievance data and trends</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Status Breakdown */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">By Status</h3>
                        <div className="space-y-4">
                            {statusStats.map((stat) => (
                                <div key={stat.status} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">{stat.status}</span>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-900">
                                        {stat._count.id}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">By Category</h3>
                        <div className="space-y-4">
                            {categoryStats.map((stat) => (
                                <div key={stat.category} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">{stat.category}</span>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-900">
                                        {stat._count.id}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Region Breakdown */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">By Region</h3>
                        <div className="space-y-4">
                            {regionStats.map((stat) => (
                                <div key={stat.regionId || "unknown"} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">
                                        {stat.regionId ? (regionMap[stat.regionId] || "Unknown Region") : "Unassigned"}
                                    </span>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-900">
                                        {stat._count.id}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
