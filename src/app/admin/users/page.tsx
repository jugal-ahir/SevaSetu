import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
    UserPlusIcon,
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    CheckBadgeIcon,
    XCircleIcon,
    PencilSquareIcon
} from "@heroicons/react/24/outline";

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const user = await getCurrentUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const pageSize = 10;

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: "desc" },
            include: {
                department: { select: { name: true } },
                region: { select: { name: true } },
            },
        }),
        prisma.user.count()
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[0%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-100/40 blur-[100px]" />
            </div>

            <Navbar userRole={user.role} userName={user.name} />

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 mb-2">
                            User Management
                        </h1>
                        <p className="text-lg text-slate-500 font-medium">
                            Manage all users, roles, and permissions across the system
                        </p>
                    </div>
                    <Link
                        href="/admin/users/new"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
                    >
                        <UserPlusIcon className="h-5 w-5" />
                        Add New User
                    </Link>
                </div>

                <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-200/60 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/50">
                        <div className="relative w-full sm:max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm font-medium"
                            />
                        </div>
                        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shrink-0">
                            <AdjustmentsHorizontalIcon className="h-5 w-5" />
                            Filter
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/80 border-b border-slate-200/60">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500">
                                        User Details
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500">
                                        Role & Assignment
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-500">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <p className="text-slate-500 font-medium">No users found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u.id} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 font-bold uppercase">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 mb-0.5">{u.name}</div>
                                                        <div className="text-sm font-medium text-slate-500">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <RoleBadge role={u.role} />
                                                    {u.department && (
                                                        <span className="text-sm font-medium text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                                                            {u.department.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {u.isVerified ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                                        <CheckBadgeIcon className="h-4 w-4" />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                                                        <XCircleIcon className="h-4 w-4" />
                                                        Unverified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <Link
                                                    href={`/admin/users/${u.id}`}
                                                    className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                >
                                                    <PencilSquareIcon className="h-4 w-4" />
                                                    Edit
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-200/60 bg-slate-50/50 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-500">
                            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} users
                        </span>
                        <div className="flex gap-2">
                            {page > 1 ? (
                                <Link
                                    href={`/admin/users?page=${page - 1}`}
                                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                                >
                                    Previous
                                </Link>
                            ) : (
                                <button className="px-4 py-2 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-300 cursor-not-allowed">
                                    Previous
                                </button>
                            )}

                            {page < totalPages ? (
                                <Link
                                    href={`/admin/users?page=${page + 1}`}
                                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                                >
                                    Next
                                </Link>
                            ) : (
                                <button className="px-4 py-2 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-300 cursor-not-allowed">
                                    Next
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function RoleBadge({ role }: { role: string }) {
    const roleConfig: Record<string, { label: string; className: string }> = {
        CITIZEN: { label: "Citizen", className: "bg-slate-100 text-slate-700 border-slate-200" },
        OFFICER: { label: "Officer", className: "bg-blue-100 text-blue-700 border-blue-200" },
        DEPT_HEAD: { label: "Dept Head", className: "bg-indigo-100 text-indigo-700 border-indigo-200" },
        ADMIN: { label: "Admin", className: "bg-purple-100 text-purple-700 border-purple-200" },
        SUPER_ADMIN: { label: "Super Admin", className: "bg-amber-100 text-amber-800 border-amber-200 animate-pulse" },
    };

    const config = roleConfig[role] || roleConfig.CITIZEN;

    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold border ${config.className}`}>
            {config.label}
        </span>
    );
}
