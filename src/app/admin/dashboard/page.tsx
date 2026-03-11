import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
    UsersIcon,
    BuildingOfficeIcon,
    TruckIcon,
    DocumentTextIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowTrendingUpIcon,
    ShieldCheckIcon
} from "@heroicons/react/24/outline";

export default async function AdminDashboard() {
    const user = await getCurrentUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    // Fetch stats
    const [totalUsers, totalDepartments, totalGrievances, totalVehicles] = await Promise.all([
        prisma.user.count(),
        prisma.department.count(),
        prisma.grievance.count(),
        prisma.vehicle.count()
    ]);

    const pendingGrievances = await prisma.grievance.count({
        where: { status: { in: ["SUBMITTED", "ASSIGNED", "IN_PROGRESS"] } },
    });
    const resolvedGrievances = await prisma.grievance.count({
        where: { status: { in: ["RESOLVED", "CLOSED"] } },
    });

    const quickActions = [
        {
            name: "Manage Users", href: "/admin/users", icon: UsersIcon,
            colors: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", hoverBg: "group-hover:bg-blue-600", hoverTitle: "group-hover:text-blue-700", shapeBg: "bg-blue-50/50", hoverBorder: "hover:border-blue-300" },
            desc: "Add or edit user accounts"
        },
        {
            name: "Departments", href: "/admin/departments", icon: BuildingOfficeIcon,
            colors: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100", hoverBg: "group-hover:bg-indigo-600", hoverTitle: "group-hover:text-indigo-700", shapeBg: "bg-indigo-50/50", hoverBorder: "hover:border-indigo-300" },
            desc: "Manage operational units"
        },
        {
            name: "Vehicles", href: "/admin/vehicles", icon: TruckIcon,
            colors: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", hoverBg: "group-hover:bg-emerald-600", hoverTitle: "group-hover:text-emerald-700", shapeBg: "bg-emerald-50/50", hoverBorder: "hover:border-emerald-300" },
            desc: "Fleet & transport tracking"
        },
        {
            name: "All Grievances", href: "/admin/grievances", icon: DocumentTextIcon,
            colors: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", hoverBg: "group-hover:bg-amber-600", hoverTitle: "group-hover:text-amber-700", shapeBg: "bg-amber-50/50", hoverBorder: "hover:border-amber-300" },
            desc: "System-wide case overview"
        },
        {
            name: "Analytics", href: "/admin/analytics", icon: ChartBarIcon,
            colors: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", hoverBg: "group-hover:bg-purple-600", hoverTitle: "group-hover:text-purple-700", shapeBg: "bg-purple-50/50", hoverBorder: "hover:border-purple-300" },
            desc: "Performance & reporting"
        },
        {
            name: "Settings", href: "/admin/settings", icon: Cog6ToothIcon,
            colors: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100", hoverBg: "group-hover:bg-slate-600", hoverTitle: "group-hover:text-slate-700", shapeBg: "bg-slate-50/50", hoverBorder: "hover:border-slate-300" },
            desc: "Platform configuration"
        },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-[100px]" />
            </div>

            <Navbar userRole={user.role} userName={user.name} />

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in space-y-8">
                <div className="mb-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
                            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-slate-900">
                                System Admin
                            </h1>
                        </div>
                        <p className="text-lg text-slate-500 font-medium">
                            Manage the entire SevaSetu platform
                        </p>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Users"
                        value={totalUsers}
                        icon={<UsersIcon className="h-6 w-6 text-blue-600" />}
                        gradient="from-blue-50 to-indigo-50"
                        borderColor="border-blue-200"
                        textColor="text-blue-900"
                    />
                    <StatCard
                        title="Departments"
                        value={totalDepartments}
                        icon={<BuildingOfficeIcon className="h-6 w-6 text-purple-600" />}
                        gradient="from-purple-50 to-fuchsia-50"
                        borderColor="border-purple-200"
                        textColor="text-purple-900"
                    />
                    <StatCard
                        title="Total Grievances"
                        value={totalGrievances}
                        icon={<DocumentTextIcon className="h-6 w-6 text-amber-600" />}
                        gradient="from-amber-50 to-orange-50"
                        borderColor="border-amber-200"
                        textColor="text-amber-900"
                    />
                    <StatCard
                        title="Vehicles"
                        value={totalVehicles}
                        icon={<TruckIcon className="h-6 w-6 text-emerald-600" />}
                        gradient="from-emerald-50 to-teal-50"
                        borderColor="border-emerald-200"
                        textColor="text-emerald-900"
                    />
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Grievance Progress */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm p-6 sm:p-8 relative overflow-hidden h-full">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-full pointer-events-none"></div>
                            <h3 className="text-xl font-heading font-bold text-slate-900 mb-6 flex items-center gap-2 relative z-10">
                                <ArrowTrendingUpIcon className="h-6 w-6 text-slate-500" />
                                Resolution Tracking
                            </h3>

                            <div className="space-y-8 relative z-10">
                                <div>
                                    <div className="flex items-end justify-between mb-2">
                                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Grievances</h4>
                                        <p className="text-3xl font-black text-amber-600 leading-none">{pendingGrievances}</p>
                                    </div>
                                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner flex mb-1">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                                            style={{ width: `${totalGrievances > 0 ? (pendingGrievances / totalGrievances) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 text-right">
                                        {totalGrievances > 0 ? ((pendingGrievances / totalGrievances) * 100).toFixed(1) : 0}% of total
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-end justify-between mb-2">
                                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Resolved Grievances</h4>
                                        <p className="text-3xl font-black text-emerald-600 leading-none">{resolvedGrievances}</p>
                                    </div>
                                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner flex mb-1">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                                            style={{ width: `${totalGrievances > 0 ? (resolvedGrievances / totalGrievances) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 text-right">
                                        {totalGrievances > 0 ? ((resolvedGrievances / totalGrievances) * 100).toFixed(1) : 0}% of total
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="lg:col-span-2">
                        <div className="rounded-3xl border border-slate-200/60 bg-white/50 backdrop-blur-xl p-6 sm:p-8">
                            <h2 className="mb-6 text-xl font-heading font-bold text-slate-900">Platform Management</h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {quickActions.map((action) => (
                                    <Link
                                        key={action.name}
                                        href={action.href}
                                        className={`group block rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${action.colors.hoverBorder} relative overflow-hidden`}
                                    >
                                        <div className={`absolute top-0 right-0 w-24 h-24 ${action.colors.shapeBg} rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>

                                        <div className="relative z-10">
                                            <div className={`mb-4 inline-flex items-center justify-center p-3 rounded-xl ${action.colors.bg} ${action.colors.text} border ${action.colors.border} shadow-inner group-hover:scale-110 ${action.colors.hoverBg} group-hover:text-white transition-all duration-300`}>
                                                <action.icon className="h-6 w-6" />
                                            </div>
                                            <h3 className={`font-bold text-slate-900 ${action.colors.hoverTitle} transition-colors`}>{action.name}</h3>
                                            <p className="mt-1 text-xs font-medium text-slate-500">{action.desc}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, gradient, borderColor, textColor }: { title: string; value: number; icon: React.ReactNode; gradient: string; borderColor: string; textColor: string }) {
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
                    {value.toLocaleString()}
                </p>
            </div>
        </div>
    );
}
