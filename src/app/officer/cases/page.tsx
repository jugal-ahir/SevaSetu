import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
    ExclamationCircleIcon,
    CheckCircleIcon,
    ClockIcon,
    MapPinIcon,
    ArrowRightIcon
} from "@heroicons/react/24/outline";

export default async function OfficerCases() {
    const user = await getCurrentUser();

    if (!user || user.role !== "OFFICER") {
        redirect("/login");
    }

    const cases = await prisma.grievance.findMany({
        where: { assignedToId: user.id },
        orderBy: { updatedAt: "desc" },
        include: {
            citizen: { select: { name: true, phone: true } },
            region: { select: { name: true } },
        },
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[0%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-[100px]" />
            </div>

            <Navbar userRole="OFFICER" userName={user.name} />

            <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 mb-2">
                            Assigned Cases
                        </h1>
                        <p className="text-lg text-slate-500 font-medium">
                            Manage and update your assigned grievances
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {cases.length === 0 ? (
                        <div className="py-20 text-center rounded-3xl border border-dashed border-slate-300 bg-white/50 backdrop-blur-sm shadow-sm">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 mb-6 border border-green-100 shadow-sm">
                                <CheckCircleIcon className="h-10 w-10 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-heading font-bold text-slate-900 mb-2">All Caught Up!</h3>
                            <p className="text-slate-500 font-medium max-w-md mx-auto">
                                You have no active cases assigned to you at the moment. Enjoy your break!
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {cases.map((grievance) => {
                                const isHighPriority = grievance.priority === "HIGH" || grievance.priority === "URGENT";
                                const isResolved = grievance.status === "RESOLVED" || grievance.status === "CLOSED";

                                return (
                                    <Link
                                        key={grievance.id}
                                        href={`/officer/grievances/${grievance.id}`}
                                        className={`group block rounded-3xl border ${isHighPriority && !isResolved ? 'border-red-200/60 bg-red-50/20' : 'border-slate-200/60 bg-white'} p-6 sm:p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${isHighPriority && !isResolved ? 'hover:border-red-300' : 'hover:border-blue-300'} relative overflow-hidden`}
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                                        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                                    <StatusBadge status={grievance.status} />
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 border border-slate-200">
                                                        ID: {grievance.id.slice(0, 8).toUpperCase()}
                                                    </span>
                                                </div>

                                                <h3 className={`text-xl font-heading font-bold mb-2 transition-colors ${isHighPriority && !isResolved ? 'text-red-900 group-hover:text-red-700' : 'text-slate-900 group-hover:text-blue-600'}`}>
                                                    {grievance.title}
                                                </h3>

                                                <p className="text-slate-600 leading-relaxed mb-6 font-medium pr-4">
                                                    {grievance.description}
                                                </p>

                                                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                                                        <ClockIcon className="h-4 w-4 text-slate-400" />
                                                        <span>Updated {new Date(grievance.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    </div>
                                                    {grievance.region && (
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                                                            <MapPinIcon className="h-4 w-4 text-blue-400" />
                                                            <span>{grievance.region.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-start md:items-end gap-4 shrink-0 border-t border-slate-100 md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0">
                                                <div className="md:text-right">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Reported By</p>
                                                    <p className="text-sm font-bold text-slate-900">{grievance.citizen.name}</p>
                                                    <p className="text-xs font-medium text-slate-500">{grievance.citizen.phone || "No phone provided"}</p>
                                                </div>

                                                {isHighPriority && (
                                                    <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700 uppercase tracking-wider border border-red-200 animate-pulse">
                                                        <ExclamationCircleIcon className="h-4 w-4" />
                                                        High Priority
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                                            <ArrowRightIcon className="h-5 w-5" />
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; className: string }> = {
        SUBMITTED: { label: "Submitted", className: "bg-blue-50 text-blue-700 ring-blue-600/20" },
        ASSIGNED: { label: "Assigned", className: "bg-indigo-50 text-indigo-700 ring-indigo-600/20" },
        IN_PROGRESS: { label: "In Progress", className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
        RESOLVED: { label: "Resolved", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
        CLOSED: { label: "Closed", className: "bg-slate-100 text-slate-700 ring-slate-400/20" },
        ESCALATED: { label: "Escalated", className: "bg-red-50 text-red-700 ring-red-600/20" },
    };

    const config = statusConfig[status] || statusConfig.SUBMITTED;

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${config.className}`}>
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${config.className.split(' ')[1].replace('text', 'bg')}`}></span>
            {config.label}
        </span>
    );
}
