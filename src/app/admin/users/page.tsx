import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default async function AdminUsersPage() {
    const user = await getCurrentUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            department: { select: { name: true } },
            region: { select: { name: true } },
        },
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole={user.role} userName={user.name} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                        <p className="mt-2 text-slate-600">Manage all users in the system</p>
                    </div>
                    <Link
                        href="/admin/users/new"
                        className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
                    >
                        Add New User
                    </Link>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                        Department
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-slate-900">{u.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {u.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <RoleBadge role={u.role} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {u.department?.name || "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {u.isVerified ? (
                                                <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                                                    Unverified
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Link
                                                href={`/admin/users/${u.id}`}
                                                className="font-medium text-blue-600 hover:text-blue-700"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

function RoleBadge({ role }: { role: string }) {
    const roleConfig: Record<string, { label: string; className: string }> = {
        CITIZEN: { label: "Citizen", className: "bg-blue-100 text-blue-700" },
        OFFICER: { label: "Officer", className: "bg-purple-100 text-purple-700" },
        DEPT_HEAD: { label: "Dept Head", className: "bg-indigo-100 text-indigo-700" },
        ADMIN: { label: "Admin", className: "bg-red-100 text-red-700" },
        SUPER_ADMIN: { label: "Super Admin", className: "bg-red-100 text-red-700" },
    };

    const config = roleConfig[role] || roleConfig.CITIZEN;

    return (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${config.className}`}>
            {config.label}
        </span>
    );
}
