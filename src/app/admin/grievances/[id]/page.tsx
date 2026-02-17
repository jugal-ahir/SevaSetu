import { redirect, notFound } from "next/navigation";
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
    ExclamationTriangleIcon
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
        const newStatus = formData.get("status") as any;
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
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole={user.role} userName={user.name} />

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <Link href="/admin/grievances" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600">
                    <ChevronLeftIcon className="h-4 w-4" />
                    Back to All Grievances
                </Link>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Main Content */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className={`rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider ${grievance.status === "ESCALATED" ? "bg-red-100 text-red-700" :
                                        grievance.status === "RESOLVED" ? "bg-green-100 text-green-700" :
                                            "bg-blue-100 text-blue-700"
                                        }`}>
                                        {grievance.status}
                                    </span>
                                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${grievance.priority === "URGENT" ? "bg-red-600 text-white animate-pulse" :
                                        grievance.priority === "HIGH" ? "bg-orange-100 text-orange-700" :
                                            "bg-slate-100 text-slate-700"
                                        }`}>
                                        {grievance.priority}
                                    </span>
                                    <span className="text-xs font-mono text-slate-400">ID: {grievance.id.slice(0, 8)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <ClockIcon className="h-4 w-4" />
                                    {new Date(grievance.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">{grievance.title}</h1>

                            {grievance.slaDueAt && (
                                <div className={`mt-6 flex items-center gap-4 rounded-2xl p-5 border ${new Date(grievance.slaDueAt) < new Date() ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"}`}>
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${new Date(grievance.slaDueAt) < new Date() ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                                        <ClockIcon className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Resolution Deadline</p>
                                        <p className={`text-lg font-bold ${new Date(grievance.slaDueAt) < new Date() ? "text-red-700" : "text-blue-900"}`}>
                                            {new Date(grievance.slaDueAt).toLocaleString()}
                                            {new Date(grievance.slaDueAt) < new Date() && <span className="ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-red-600 text-white animate-pulse">SLA BREACHED</span>}
                                        </p>
                                    </div>
                                    {grievance.priority === "URGENT" && (
                                        <div className="hidden sm:flex items-center gap-2 rounded-full bg-red-600 px-4 py-1.5 text-xs font-black text-white uppercase tracking-widest">
                                            <ExclamationTriangleIcon className="h-4 w-4" />
                                            Urgent
                                        </div>
                                    )}
                                </div>
                            )}

                            <p className="mt-8 text-lg text-slate-600 whitespace-pre-wrap leading-relaxed">
                                {grievance.description}
                            </p>

                            {grievance.imageUrl && (
                                <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
                                    <img src={grievance.imageUrl} alt="Attachment" className="w-full object-cover transition-transform hover:scale-[1.02]" />
                                </div>
                            )}
                        </div>

                        {/* Audit History */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                                <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                                System Audit Trail
                            </h2>
                            <div className="space-y-8">
                                {grievance.history.map((item, idx) => (
                                    <div key={item.id} className="relative pl-10">
                                        {idx !== grievance.history.length - 1 && (
                                            <div className="absolute left-[19px] top-6 h-full w-px bg-slate-100" />
                                        )}
                                        <div className="absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 border border-slate-200">
                                            <div className="h-2 w-2 rounded-full bg-current" />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold text-slate-900">Status: {item.toStatus}</p>
                                                <time className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</time>
                                            </div>
                                            <p className="mt-1 text-slate-600">{item.note}</p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 uppercase">
                                                    {(item.changedBy?.name?.[0] || 'S')}
                                                </div>
                                                <span className="text-xs font-medium text-slate-500">{item.changedBy?.name || "System"}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Admin Actions Sidebar */}
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm ring-1 ring-blue-50">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                                Administrative Override
                            </h2>
                            <form action={adminUpdateGrievance} className="space-y-5">
                                <input type="hidden" name="grievanceId" value={grievance.id} />

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Modify Status</label>
                                    <select name="status" defaultValue={grievance.status} className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none">
                                        <option value="SUBMITTED">Submitted</option>
                                        <option value="ASSIGNED">Assigned</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="RESOLVED">Resolved</option>
                                        <option value="CLOSED">Closed/Archived</option>
                                        <option value="ESCALATED">Escalated</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Transfer Department</label>
                                    <select name="departmentId" defaultValue={grievance.departmentId || ""} className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none">
                                        <option value="">No Change</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Internal Note</label>
                                    <textarea
                                        name="note"
                                        rows={4}
                                        className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none"
                                        placeholder="Reason for administrative change..."
                                    />
                                </div>

                                <button type="submit" className="w-full rounded-xl bg-slate-900 px-6 py-4 font-bold text-white shadow-xl hover:bg-black hover:-translate-y-0.5 transition-all focus:ring-4 focus:ring-slate-300">
                                    Commit Changes
                                </button>
                            </form>

                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <h3 className="text-xs font-bold text-red-600 uppercase tracking-widest pl-1 mb-4 flex items-center gap-2">
                                    <ExclamationTriangleIcon className="h-4 w-4" />
                                    Danger Zone
                                </h3>
                                <AdminDeleteGrievanceForm
                                    grievanceId={grievance.id}
                                    onDelete={adminDeleteGrievance}
                                />
                            </div>
                        </div>

                        {/* Secondary Info */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ownership Details</h3>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
                                    <UserIcon className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">{grievance.citizen.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{grievance.citizen.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 border-t border-slate-50 pt-5">
                                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
                                    <MapPinIcon className="h-6 w-6" />
                                </div>
                                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                    {grievance.address || "Digital Submission"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
