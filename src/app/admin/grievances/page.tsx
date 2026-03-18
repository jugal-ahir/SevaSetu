import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
    ClipboardDocumentListIcon,
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    EyeIcon
} from "@heroicons/react/24/outline";
import SearchAndFilter from "./SearchAndFilter";

export default async function AdminGrievancesList({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; status?: string }>;
}) {
    const user = await getCurrentUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    const { q = "", status = "" } = await searchParams;

    const grievances = await prisma.grievance.findMany({
        where: {
            AND: [
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                status ? { status: status as any } : {},
                q ? {
                    OR: [
                        { id: { contains: q } },
                        { title: { contains: q } },
                        { citizen: { name: { contains: q } } },
                    ]
                } : {},
            ]
        },
        orderBy: { createdAt: "desc" },
        include: {
            citizen: { select: { name: true } },
            department: { select: { name: true } },
            region: { select: { name: true } },
        }
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-amber-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[0%] left-[-10%] w-[60%] h-[60%] rounded-full bg-amber-100/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-orange-100/40 blur-[100px]" />
            </div>

            <Navbar userRole={user.role} userName={user.name} />

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 mb-2 flex items-center gap-3">
                            <ClipboardDocumentListIcon className="h-8 w-8 text-amber-600" />
                            System Grievances
                        </h1>
                        <p className="text-lg text-slate-500 font-medium ml-11">
                            Master view of all issues reported across all departments
                        </p>
                    </div>
                    <div className="flex items-center gap-3 ml-11 md:ml-0">
                        <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 shadow-sm text-sm font-bold text-amber-700">
                            Total: {grievances.length}
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm overflow-hidden">
                    <SearchAndFilter initialQuery={q} initialStatus={status} />

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 border-b border-slate-200/60">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 w-1/3">Issue Details</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Department & Location</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Reporter</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {grievances.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <p className="text-slate-500 font-medium">No grievances found in the system.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    grievances.map(g => (
                                        <tr key={g.id} className="hover:bg-amber-50/30 transition-colors group">
                                            <td className="px-6 py-5 align-top">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        #{g.id.substring(0, 8)} • {new Date(g.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <p className="text-sm font-bold text-slate-900 line-clamp-2 leading-relaxed">{g.title}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 align-top">
                                                <StatusBadge status={g.status} />
                                            </td>
                                            <td className="px-6 py-5 align-top">
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-sm font-medium text-slate-700 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg inline-flex max-w-max">
                                                        {g.department?.name || "Unassigned"}
                                                    </span>
                                                    {g.region && (
                                                        <span className="text-xs font-medium text-slate-500">{g.region.name}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 align-top">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 font-bold text-xs uppercase shadow-sm">
                                                        {g.citizen.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">{g.citizen.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 align-top text-right">
                                                <Link
                                                    href={`/admin/grievances/${g.id}`}
                                                    className="inline-flex items-center gap-1.5 font-bold text-amber-600 hover:text-amber-800 transition-colors bg-amber-50 hover:bg-amber-100 border border-amber-200/50 px-3 py-1.5 rounded-lg"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; className: string }> = {
        SUBMITTED: { label: "Submitted", className: "bg-blue-50 text-blue-700 border-blue-200" },
        ASSIGNED: { label: "Assigned", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
        IN_PROGRESS: { label: "In Progress", className: "bg-amber-50 text-amber-700 border-amber-200" },
        RESOLVED: { label: "Resolved", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        CLOSED: { label: "Closed", className: "bg-slate-100 text-slate-700 border-slate-200" },
        ESCALATED: { label: "Escalated", className: "bg-red-50 text-red-700 border-red-200" },
    };

    const config = statusConfig[status] || statusConfig.SUBMITTED;

    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold border ${config.className}`}>
            {config.label}
        </span>
    );
}
