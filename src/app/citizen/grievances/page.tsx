import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { DocumentTextIcon, PlusCircleIcon, ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default async function CitizenGrievancesPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== "CITIZEN") {
        redirect("/login");
    }

    const grievances = await prisma.grievance.findMany({
        where: { citizenId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
            department: true,
            region: true,
            assignedTo: { select: { name: true } },
        },
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-100/40 blur-[100px]" />
            </div>

            <Navbar userRole={user.role} userName={user.name} />

            <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">

                <div className="mb-8">
                    <Link href="/citizen/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-4">
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 mb-2">
                                My Grievances
                            </h1>
                            <p className="text-lg text-slate-500 font-medium">
                                Track the status and progress of all your submitted reports.
                            </p>
                        </div>

                        <Link
                            href="/citizen/grievances/new"
                            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105 hover:shadow-blue-500/40 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                            <span className="relative flex items-center gap-2">
                                <PlusCircleIcon className="h-5 w-5" />
                                Report New Issue
                            </span>
                        </Link>
                    </div>
                </div>

                {grievances.length === 0 ? (
                    <div className="py-20 text-center rounded-3xl border border-slate-200/60 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 mb-6 border border-slate-100">
                            <DocumentTextIcon className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-slate-900 mb-2">No active reports found</h3>
                        <p className="max-w-md mx-auto text-base text-slate-500 mb-8 font-medium">
                            You currently do not have any submitted grievances. If you encounter any civic issues in your area, please report them to help us improve.
                        </p>
                        <Link
                            href="/citizen/grievances/new"
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 hover:scale-105"
                        >
                            Submit your first report <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {grievances.map((grievance) => (
                            <Link
                                key={grievance.id}
                                href={`/citizen/grievances/${grievance.id}`}
                                className="group block rounded-3xl border border-slate-200/60 bg-white p-6 sm:p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <StatusBadge status={grievance.status} />
                                            <span className="text-sm font-bold text-slate-400">
                                                ID: #{grievance.id.substring(0, 8).toUpperCase()}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-heading font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                                            {grievance.title}
                                        </h3>

                                        <p className="text-base text-slate-600 line-clamp-2 mb-5 leading-relaxed">
                                            {grievance.description}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 border border-slate-200">
                                                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                                {grievance.category}
                                            </span>

                                            {grievance.department && (
                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 text-blue-700 px-3 py-1.5 border border-blue-100">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                    {grievance.department.name}
                                                </span>
                                            )}

                                            <span className="text-slate-400 flex items-center gap-1.5 px-2">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {new Date(grievance.createdAt).toLocaleDateString(undefined, {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="hidden md:flex flex-col items-end justify-center shrink-0">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors text-slate-400 border border-slate-100 group-hover:border-blue-100 shadow-sm">
                                            <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Details
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
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
