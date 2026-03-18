import { redirect, notFound } from "next/navigation";
import { GrievanceStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import AdminDeleteGrievanceForm from "@/components/AdminDeleteGrievanceForm";
import {
    ChevronLeftIcon,
    ShieldCheckIcon,
    MapPinIcon,
    UserIcon,
    BuildingOfficeIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    WrenchScrewdriverIcon,
    ArrowsRightLeftIcon,
    DocumentTextIcon,
    TrashIcon
} from "@heroicons/react/24/outline";

export default async function AdminGrievanceDetail({ params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    const grievance = await prisma.grievance.findUnique({
        where: { id },
        include: {
            citizen: true,
            assignedTo: { select: { name: true, id: true } },
            department: { select: { name: true, id: true } },
            region: true,
            history: {
                orderBy: { createdAt: "desc" },
                include: { changedBy: { select: { name: true } } }
            }
        }
    });

    if (!grievance) {
        notFound();
    }

    const departments = await prisma.department.findMany({ select: { id: true, name: true } });

    async function adminUpdateGrievance(formData: FormData) {
        "use server";
        const newStatus = formData.get("status") as GrievanceStatus;
        const departmentId = formData.get("departmentId") as string;
        const note = formData.get("note") as string;
        const grievanceId = formData.get("grievanceId") as string;

        const [user, currentGrievance] = await Promise.all([
            getCurrentUser(),
            prisma.grievance.findUnique({ where: { id: grievanceId } })
        ]);

        if (!user || !currentGrievance) return;

        await prisma.$transaction([
            prisma.grievance.update({
                where: { id: grievanceId },
                data: {
                    status: newStatus,
                    departmentId: departmentId || currentGrievance.departmentId,
                },
            }),
            prisma.grievanceStatusHistory.create({
                data: {
                    grievanceId,
                    fromStatus: currentGrievance.status,
                    toStatus: newStatus,
                    changedById: user.id,
                    note: note || `Administrative update by ${user.role}`,
                },
            }),
            prisma.auditLog.create({
                data: {
                    action: "UPDATE_GRIEVANCE_STATUS",
                    grievanceId: grievanceId,
                    entity: "Grievance",
                    entityId: grievanceId,
                    metadata: JSON.stringify({ oldStatus: currentGrievance.status, newStatus, departmentId }),
                    actorId: user.id,
                }
            })
        ]);

        redirect(`/admin/grievances`);
    }

    async function adminDeleteGrievance(formData: FormData) {
        "use server";
        const grievanceId = formData.get("grievanceId") as string;
        const user = await getCurrentUser();

        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return;

        // Log the action first, then delete concurrently
        await prisma.auditLog.create({
            data: {
                action: "UPDATE_GRIEVANCE_STATUS",
                entity: "Grievance",
                entityId: grievanceId,
                metadata: JSON.stringify({ action: "DELETE_GRIEVANCE", deletedGrievanceId: grievanceId }),
                actorId: user.id,
            }
        });

        await prisma.grievance.delete({
            where: { id: grievanceId },
        });

        redirect(`/admin/grievances`);
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-amber-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-amber-100/30 blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-100/30 blur-[120px]" />
            </div>

            <Navbar userRole={user.role} userName={user.name} />

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="mb-6">
                    <Link href="/admin/grievances" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-amber-600 transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200/60 shadow-sm w-fit">
                        <ChevronLeftIcon className="h-4 w-4" />
                        Back to Grievances Registry
                    </Link>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Main Content */}
                        <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm p-6 sm:p-8 relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                <div className="flex flex-wrap items-center gap-3">
                                    <StatusBadge status={grievance.status} />
                                    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border ${grievance.priority === "URGENT" ? "bg-red-50 text-red-700 border-red-200 animate-pulse" :
                                        grievance.priority === "HIGH" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                            "bg-slate-50 text-slate-600 border-slate-200"
                                        }`}>
                                        {grievance.priority === "URGENT" && <ExclamationTriangleIcon className="h-3.5 w-3.5" />}
                                        {grievance.priority}
                                    </span>
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-500">
                                        <DocumentTextIcon className="h-4 w-4" />
                                        #{grievance.id.slice(0, 8).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-fit">
                                    <ClockIcon className="h-4 w-4" />
                                    Submitted {new Date(grievance.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>

                            <h1 className="text-3xl sm:text-4xl font-heading font-black text-slate-900 leading-tight mb-8">
                                {grievance.title}
                            </h1>

                            {/* Info Grid */}
                            <div className="grid sm:grid-cols-2 gap-4 mb-8">
                                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-start gap-4 hover:border-blue-200 hover:bg-white transition-colors group">
                                    <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
                                        <UserIcon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1 mt-0.5">Reporter</p>
                                        <p className="text-sm font-bold text-slate-900 truncate">{grievance.citizen.name}</p>
                                        <p className="text-xs font-medium text-slate-500 truncate">{grievance.citizen.email}</p>
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-start gap-4 hover:border-indigo-200 hover:bg-white transition-colors group">
                                    <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                                        <BuildingOfficeIcon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1 mt-0.5">Assigned To</p>
                                        <p className="text-sm font-bold text-slate-900 truncate">{grievance.department?.name || "Unassigned"}</p>
                                        <p className="text-xs font-medium text-slate-500 truncate">{grievance.assignedTo?.name ? `Officer: ${grievance.assignedTo.name}` : "Pending Assignment"}</p>
                                    </div>
                                </div>

                                {grievance.address && (
                                    <div className="sm:col-span-2 rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-start gap-4">
                                        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 shadow-inner mt-1">
                                            <MapPinIcon className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1 mt-0.5">Location</p>
                                            <p className="text-sm font-bold text-slate-900 leading-relaxed">{grievance.address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 sm:p-8">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Description of Issue</h3>
                                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                                    {grievance.description}
                                </p>
                            </div>

                            {grievance.imageUrl && (
                                <div className="mt-8 rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden bg-white p-2">
                                    <img src={grievance.imageUrl} alt="Attachment" className="w-full h-auto max-h-[500px] object-contain rounded-xl" />
                                </div>
                            )}
                        </div>

                        {/* Audit History */}
                        <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm p-6 sm:p-8">
                            <h2 className="text-xl font-heading font-bold text-slate-900 mb-8 flex items-center gap-2">
                                <ShieldCheckIcon className="h-6 w-6 text-indigo-500" />
                                System Audit Trail
                            </h2>
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                {grievance.history.map((entry, index) => {
                                    const isLatest = index === 0;
                                    return (
                                        <div key={entry.id} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                                                {isLatest ? (
                                                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-inner">
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

                    {/* Admin Actions Sidebar */}
                    <div className="space-y-6">
                        {grievance.slaDueAt && (
                            <div className={`rounded-3xl border p-6 sm:p-8 bg-gradient-to-br ${new Date(grievance.slaDueAt) < new Date()
                                    ? "from-red-50 to-white border-red-200/60 shadow-red-500/5 shadow-sm"
                                    : "from-amber-50 to-white border-amber-200/60 shadow-amber-500/5 shadow-sm"
                                }`}>
                                <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2 ${new Date(grievance.slaDueAt) < new Date() ? "text-red-700" : "text-amber-800"
                                    }`}>
                                    <ClockIcon className="h-5 w-5" />
                                    Resolution Target
                                </h3>
                                <div>
                                    <p className={`text-2xl font-black ${new Date(grievance.slaDueAt) < new Date() ? "text-red-900" : "text-amber-900"
                                        }`}>
                                        {new Date(grievance.slaDueAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className={`text-sm font-bold ${new Date(grievance.slaDueAt) < new Date() ? "text-red-600" : "text-amber-700"
                                        }`}>
                                        {new Date(grievance.slaDueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {new Date(grievance.slaDueAt) < new Date() && " (SLA Overdue)"}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="rounded-3xl border border-slate-200/60 bg-white shadow-sm overflow-hidden ring-1 ring-blue-50">
                            <div className="bg-slate-900 px-6 py-5 border-b border-slate-800 flex items-center gap-3">
                                <WrenchScrewdriverIcon className="h-5 w-5 text-blue-400" />
                                <h2 className="text-lg font-bold text-white tracking-wide">
                                    Administrative Override
                                </h2>
                            </div>

                            <form action={adminUpdateGrievance} className="p-6 sm:p-8 space-y-6">
                                <input type="hidden" name="grievanceId" value={grievance.id} />

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Modify Status</label>
                                    <div className="relative">
                                        <select
                                            name="status"
                                            defaultValue={grievance.status}
                                            className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none outline-none cursor-pointer"
                                        >
                                            <option value="SUBMITTED">Submitted</option>
                                            <option value="ASSIGNED">Assigned</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="RESOLVED">Resolved</option>
                                            <option value="CLOSED">Closed (Archived)</option>
                                            <option value="ESCALATED">Escalated</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <ArrowsRightLeftIcon className="h-4 w-4 text-slate-400 rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Transfer Department</label>
                                    <div className="relative">
                                        <select
                                            name="departmentId"
                                            defaultValue={grievance.departmentId || ""}
                                            className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none outline-none cursor-pointer"
                                        >
                                            <option value="">No Change</option>
                                            {departments.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <BuildingOfficeIcon className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Internal Audit Note</label>
                                    <textarea
                                        name="note"
                                        rows={3}
                                        className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none resize-none"
                                        placeholder="Reason for override..."
                                    />
                                </div>

                                <button type="submit" className="w-full rounded-xl bg-slate-900 px-6 py-4 font-bold text-white shadow-xl hover:bg-black hover:shadow-2xl transition-all active:scale-[0.98] outline-none">
                                    Commit Force Updates
                                </button>
                            </form>

                            <div className="p-6 sm:p-8 border-t border-slate-100 bg-red-50/30">
                                <h3 className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <TrashIcon className="h-4 w-4" />
                                    Danger Zone
                                </h3>
                                <div className="text-center">
                                    <AdminDeleteGrievanceForm
                                        grievanceId={grievance.id}
                                        onDelete={adminDeleteGrievance}
                                    />
                                    <p className="text-xs text-red-500/80 mt-3 font-medium">This action cannot be undone.</p>
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
        <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${config.className}`}>
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${config.className.split(' ')[1].replace('text', 'bg')}`}></span>
            {config.label}
        </span>
    );
}
