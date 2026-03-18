import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
    ChevronLeftIcon,
    ClockIcon,
    MapPinIcon,
    UserIcon,
    BuildingOfficeIcon,
    ExclamationTriangleIcon,
    DocumentIcon,
    UserGroupIcon,
    AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";
import { GrievanceStatus } from "@prisma/client";

export default async function DeptHeadGrievanceDetail({ params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user || user.role !== "DEPT_HEAD") {
        redirect("/login");
    }

    const grievance = await prisma.grievance.findUnique({
        where: { id },
        include: {
            citizen: true,
            assignedTo: { select: { name: true, id: true } },
            region: true,
            history: {
                orderBy: { createdAt: "desc" },
                include: { changedBy: { select: { name: true } } }
            }
        }
    });

    if (!grievance || grievance.departmentId !== user.departmentId) {
        notFound();
    }

    const officers = await prisma.user.findMany({
        where: { departmentId: user.departmentId, role: "OFFICER" },
        select: { id: true, name: true }
    });

    async function assignOfficer(formData: FormData) {
        "use server";
        const officerId = formData.get("officerId") as string;
        const grievanceId = formData.get("grievanceId") as string;

        if (!grievance || !user) return;

        await prisma.$transaction([
            prisma.grievance.update({
                where: { id: grievanceId },
                data: { assignedToId: officerId, status: "ASSIGNED" },
            }),
            prisma.grievanceStatusHistory.create({
                data: {
                    grievanceId,
                    fromStatus: grievance.status,
                    toStatus: "ASSIGNED",
                    changedById: user.id,
                    note: `Assigned to ${officers.find(o => o.id === officerId)?.name}`,
                },
            }),
        ]);

        redirect(`/dept-head/dashboard`);
    }

    async function updateStatus(formData: FormData) {
        "use server";
        const status = formData.get("status") as GrievanceStatus;
        const note = formData.get("note") as string;
        const grievanceId = formData.get("grievanceId") as string;

        if (!grievance || !user) return;

        await prisma.$transaction([
            prisma.grievance.update({
                where: { id: grievanceId },
                data: { status },
            }),
            prisma.grievanceStatusHistory.create({
                data: {
                    grievanceId,
                    fromStatus: grievance.status,
                    toStatus: status,
                    changedById: user.id,
                    note: note || `Status updated to ${status} by Department Head.`,
                },
            }),
        ]);

        redirect(`/dept-head/dashboard`);
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-100/40 blur-[100px]" />
            </div>

            <Navbar userRole="DEPT_HEAD" userName={user.name} />

            <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="mb-8">
                    <Link href="/dept-head/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-4">
                        <ChevronLeftIcon className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <StatusBadge status={grievance.status} />
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 border border-slate-200">
                                    ID: {grievance.id.slice(0, 8).toUpperCase()}
                                </span>
                                {grievance.priority === "URGENT" && (
                                    <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 border border-red-200 animate-pulse">
                                        <ExclamationTriangleIcon className="h-4 w-4" />
                                        Urgent
                                    </span>
                                )}
                                {grievance.priority === "HIGH" && (
                                    <span className="flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700 border border-orange-200">
                                        High Priority
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 mb-2">
                                {grievance.title}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description Card */}
                        <div className="rounded-3xl border border-slate-200/60 bg-white shadow-sm p-6 sm:p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-full -mr-10 -mt-10 pointer-events-none transition-colors group-hover:bg-blue-50/50"></div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-heading font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <DocumentIcon className="h-6 w-6 text-blue-500" />
                                    Issue Description
                                </h3>
                                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 mb-8 text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                                    {grievance.description}
                                </div>

                                {grievance.imageUrl && (
                                    <div className="mb-8 group/img relative overflow-hidden rounded-2xl border border-slate-200/60 shadow-sm">
                                        <div className="absolute inset-0 bg-blue-900/0 group-hover/img:bg-blue-900/10 transition-colors z-10 pointer-events-none"></div>
                                        <img
                                            src={grievance.imageUrl}
                                            alt="Grievance Attachment"
                                            className="w-full object-cover max-h-[400px] transition-transform duration-500 group-hover/img:scale-105"
                                        />
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500 pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                                        <ClockIcon className="h-4 w-4 text-slate-400" />
                                        <span>Submitted {new Date(grievance.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                                        <ClockIcon className="h-4 w-4 text-slate-400" />
                                        <span>Updated {new Date(grievance.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Timeline */}
                        <div className="rounded-3xl border border-slate-200/60 bg-white shadow-sm p-6 sm:p-8">
                            <h2 className="text-xl font-heading font-bold text-slate-900 mb-8 flex items-center gap-2">
                                <ClockIcon className="h-6 w-6 text-indigo-500" />
                                Case History
                            </h2>
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                {grievance.history.map((entry, index) => {
                                    const isLatest = index === 0;
                                    return (
                                        <div key={entry.id} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                                                {isLatest ? (
                                                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-inner">
                                                        <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                                                    </div>
                                                ) : (
                                                    <div className="h-4 w-4 rounded-full bg-slate-300"></div>
                                                )}
                                            </div>

                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-white border border-slate-200/60 shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1 relative">
                                                <div className="hidden md:block absolute top-[1.2rem] w-4 h-4 bg-white border-t border-r border-slate-200/60 rotate-45 transform group-odd:-left-2 group-odd:-rotate-135 group-odd:border-r-0 group-odd:border-b group-even:-right-2 group-even:border-l-0 group-even:border-b-0"></div>

                                                <div className="flex flex-col gap-2 mb-3">
                                                    <div className="flex items-center justify-between">
                                                        <StatusBadge status={entry.toStatus} />
                                                        <span className="text-xs font-bold text-slate-400">
                                                            {new Date(entry.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-sm font-medium text-slate-700">
                                                    By <span className="font-bold text-slate-900">{entry.changedBy?.name || "System"}</span>
                                                </p>

                                                {entry.note && (
                                                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600 italic">
                                                        &quot;{entry.note}&quot;
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* SLA Status */}
                        {grievance.slaDueAt && (
                            <div className={`rounded-3xl border p-6 bg-gradient-to-br ${new Date(grievance.slaDueAt) < new Date()
                                ? "from-red-50 to-white border-red-200/60 shadow-red-500/5 shadow-lg"
                                : "from-blue-50 to-white border-blue-200/60 shadow-blue-500/5 shadow-lg"
                                }`}>
                                <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${new Date(grievance.slaDueAt) < new Date() ? "text-red-700" : "text-blue-700"
                                    }`}>
                                    <ClockIcon className="h-5 w-5" />
                                    Resolution Target
                                </h3>
                                <div className="mt-4">
                                    <p className={`text-2xl font-black ${new Date(grievance.slaDueAt) < new Date() ? "text-red-900" : "text-blue-900"
                                        }`}>
                                        {new Date(grievance.slaDueAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className={`text-sm font-bold ${new Date(grievance.slaDueAt) < new Date() ? "text-red-600" : "text-blue-600"
                                        }`}>
                                        {new Date(grievance.slaDueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {new Date(grievance.slaDueAt) < new Date() && " (SLA Overdue)"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Assignment Panel */}
                        <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-blue-500/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
                            <h2 className="text-lg font-heading font-bold text-slate-900 mb-6 relative z-10 flex items-center gap-2">
                                <UserGroupIcon className="h-5 w-5 text-indigo-500" />
                                Assignment Panel
                            </h2>
                            <form action={assignOfficer} className="space-y-5 relative z-10">
                                <input type="hidden" name="grievanceId" value={grievance.id} />
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Assign to Officer</label>
                                    <select
                                        name="officerId"
                                        required
                                        defaultValue={grievance.assignedToId || ""}
                                        className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Select an officer to assign</option>
                                        {officers.map(o => (
                                            <option key={o.id} value={o.id}>
                                                {o.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-bold text-white hover:from-blue-700 hover:to-indigo-700 shadow-[0_8px_16px_-6px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_20px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                    Confirm Assignment
                                </button>
                            </form>
                        </div>

                        {/* Status Management Panel */}
                        <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-emerald-500/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
                            <h2 className="text-lg font-heading font-bold text-slate-900 mb-6 relative z-10 flex items-center gap-2">
                                <AdjustmentsHorizontalIcon className="h-5 w-5 text-emerald-500" />
                                Status Management
                            </h2>
                            <form action={updateStatus} className="space-y-5 relative z-10">
                                <input type="hidden" name="grievanceId" value={grievance.id} />
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">New Status</label>
                                    <select
                                        name="status"
                                        required
                                        defaultValue={grievance.status}
                                        className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="ASSIGNED">Assigned</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="RESOLVED">Resolved</option>
                                        <option value="ESCALATED">Escalated</option>
                                        <option value="CLOSED">Closed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Note (Optional)</label>
                                    <textarea
                                        name="note"
                                        rows={2}
                                        className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all resize-none"
                                        placeholder="Add a reason for this status change..."
                                    />
                                </div>
                                <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3.5 text-sm font-bold text-white hover:from-emerald-700 hover:to-teal-700 shadow-[0_8px_16px_-6px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_20px_-6px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                                    Update Case Status
                                </button>
                            </form>
                        </div>

                        {/* Case Details */}
                        <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Reporter Information</h3>
                            <div className="flex items-center gap-4 mb-5">
                                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 border border-blue-200/50 shadow-inner">
                                    <UserIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{grievance.citizen.name}</p>
                                    <p className="text-sm font-medium text-slate-500">{grievance.citizen.email}</p>
                                </div>
                            </div>
                            <div className="space-y-3 pt-5 border-t border-slate-100">
                                {grievance.citizen.phone && (
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                                        <p className="text-sm font-bold text-slate-900">{grievance.citizen.phone}</p>
                                    </div>
                                )}
                                <div className="flex items-start justify-between">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Region</p>
                                    <p className="text-sm font-bold text-slate-900 text-right max-w-[150px] leading-tight">{grievance.region?.name || "Unassigned"}</p>
                                </div>
                                <div className="flex items-start justify-between">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</p>
                                    <p className="text-sm font-medium text-slate-700 text-right max-w-[150px] leading-tight">{grievance.address || "Not provided"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
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
