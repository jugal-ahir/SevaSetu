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
    Cog6ToothIcon
} from "@heroicons/react/24/outline";

export default async function AdminDashboard() {
    const user = await getCurrentUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    // Fetch stats
    const totalUsers = await prisma.user.count();
    const totalDepartments = await prisma.department.count();
    const totalGrievances = await prisma.grievance.count();
    const totalVehicles = await prisma.vehicle.count();
    const pendingGrievances = await prisma.grievance.count({
        where: { status: { in: ["SUBMITTED", "ASSIGNED", "IN_PROGRESS"] } },
    });
    const resolvedGrievances = await prisma.grievance.count({
        where: { status: { in: ["RESOLVED", "CLOSED"] } },
    });

    const quickActions = [
        { name: "Manage Users", href: "/admin/users", icon: UsersIcon, color: "blue" },
        { name: "Departments", href: "/admin/departments", icon: BuildingOfficeIcon, color: "purple" },
        { name: "Vehicles", href: "/admin/vehicles", icon: TruckIcon, color: "green" },
        { name: "All Grievances", href: "/admin/grievances", icon: DocumentTextIcon, color: "amber" },
        { name: "Analytics", href: "/admin/analytics", icon: ChartBarIcon, color: "indigo" },
        { name: "Settings", href: "/admin/settings", icon: Cog6ToothIcon, color: "slate" },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole={user.role} userName={user.name} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                    <p className="mt-2 text-slate-600">Manage the entire SevaSetu platform</p>
                </div>

                {/* Stats Grid */}
                <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Users" value={totalUsers} icon={<UsersIcon className="h-6 w-6" />} color="blue" />
                    <StatCard title="Departments" value={totalDepartments} icon={<BuildingOfficeIcon className="h-6 w-6" />} color="purple" />
                    <StatCard title="Total Grievances" value={totalGrievances} icon={<DocumentTextIcon className="h-6 w-6" />} color="amber" />
                    <StatCard title="Vehicles" value={totalVehicles} icon={<TruckIcon className="h-6 w-6" />} color="green" />
                </div>

                {/* Grievance Stats */}
                <div className="mb-8 grid gap-6 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-slate-600">Pending Grievances</h3>
                        <p className="mt-2 text-3xl font-bold text-amber-600">{pendingGrievances}</p>
                        <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
                            <div
                                className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                                style={{ width: `${totalGrievances > 0 ? (pendingGrievances / totalGrievances) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-slate-600">Resolved Grievances</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600">{resolvedGrievances}</p>
                        <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
                            <div
                                className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                                style={{ width: `${totalGrievances > 0 ? (resolvedGrievances / totalGrievances) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="mb-6 text-xl font-bold text-slate-900">Quick Actions</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {quickActions.map((action) => (
                            <Link
                                key={action.name}
                                href={action.href}
                                className="card-hover group rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                            >
                                <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br p-3 text-${action.color}-600 from-${action.color}-50 to-${action.color}-100 transition-all group-hover:scale-110`}>
                                    <action.icon className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-slate-900">{action.name}</h3>
                                <p className="mt-1 text-sm text-slate-600">Manage and configure {action.name.toLowerCase()}</p>
                            </Link>
                        ))}
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
    value: number;
    icon: React.ReactNode;
    color: string;
}) {
    return (
        <div className="card-hover rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-600">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-3 text-blue-600">
                    {icon}
                </div>
            </div>
        </div>
    );
}
