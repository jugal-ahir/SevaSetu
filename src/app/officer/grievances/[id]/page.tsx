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
    ChatBubbleLeftEllipsisIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default async function OfficerGrievanceDetail({ params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user || user.role !== "OFFICER") {
        redirect("/login");
    }

    const grievance = await prisma.grievance.findUnique({
        where: { id },
        include: {
            citizen: true,
            region: true,
            history: {
                orderBy: { createdAt: "desc" },
                include: { changedBy: { select: { name: true } } }
            }
        }
    });

    if (!grievance || grievance.assignedToId !== user.id) {
        notFound();
    }

    async function updateStatus(formData: FormData) {
        "use server";
        const newStatus = formData.get("status") as any;
        const note = formData.get("note") as string;
        const grievanceId = formData.get("grievanceId") as string;

        if (!grievance || !user) return;

        await prisma.$transaction([
            prisma.grievance.update({
                where: { id: grievanceId },
                data: { status: newStatus },
            }),
            prisma.grievanceStatusHistory.create({
                data: {
                    grievanceId,
                    fromStatus: grievance.status,
                    toStatus: newStatus,
                    changedById: user.id,
                    note: note || `Status updated to ${newStatus}`,
                },
            }),
        ]);

        redirect(`/officer/cases`);
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole="OFFICER" userName={user.name} />

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <Link href="/officer/cases" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                    <ChevronLeftIcon className="h-4 w-4" />
                    Back to Assigned Cases
                </Link>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex gap-2 items-center">
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${grievance.status === "ESCALATED" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                        }`}>
                                        {grievance.status}
                                    </span>
                                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${grievance.priority === "URGENT" ? "bg-red-600 text-white animate-pulse" :
                                        grievance.priority === "HIGH" ? "bg-orange-100 text-orange-700" :
                                            "bg-slate-100 text-slate-700"
                                        }`}>
                                        {grievance.priority}
                                    </span>
                                </div>
                                <span className="text-xs text-slate-400">ID: {grievance.id.slice(0, 8)}</span>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">{grievance.title}</h1>

                            {grievance.slaDueAt && (
                                <div className={`mt-4 flex items-center gap-3 rounded-xl p-4 ${new Date(grievance.slaDueAt) < new Date() ? "bg-red-50 text-red-700 border border-red-100" : "bg-blue-50 text-blue-700 border border-blue-100"}`}>
                                    <ClockIcon className="h-5 w-5" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Resolution Deadline</p>
                                        <p className="text-sm font-bold">
                                            {new Date(grievance.slaDueAt).toLocaleString()}
                                            {new Date(grievance.slaDueAt) < new Date() && " (SLA BREACHED)"}
                                        </p>
                                    </div>
                                    {grievance.priority === "URGENT" && (
                                        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-[10px] font-black text-white uppercase tracking-widest">
                                            <ExclamationTriangleIcon className="h-3 w-3" />
                                            Urgent
                                        </div>
                                    )}
                                </div>
                            )}

                            <p className="mt-6 text-slate-700 whitespace-pre-wrap leading-relaxed">{grievance.description}</p>

                            {grievance.imageUrl && (
                                <div className="mt-6">
                                    <img src={grievance.imageUrl} alt="Grievance Attachment" className="rounded-xl border border-slate-200 max-h-96 w-full object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Case History</h2>
                            <div className="space-y-6">
                                {grievance.history.map((item) => (
                                    <div key={item.id} className="relative pl-6 pb-6 border-l-2 border-slate-100 last:pb-0">
                                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-slate-200 border-2 border-white"></div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-900">
                                                    Status changed to {item.toStatus}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(item.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-slate-600">{item.note}</p>
                                            <p className="mt-2 text-xs font-medium text-slate-500">By {item.changedBy?.name || "System"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Action Panel</h2>
                            <form action={updateStatus} className="space-y-4">
                                <input type="hidden" name="grievanceId" value={grievance.id} />
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Update Status</label>
                                    <select name="status" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500">
                                        <option value="IN_PROGRESS">Mark In Progress</option>
                                        <option value="RESOLVED">Mark Resolved</option>
                                        <option value="ESCALATED">Escalate to Dept Head</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Add Remark</label>
                                    <textarea name="note" rows={3} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500" placeholder="Tell us about the progress..." />
                                </div>
                                <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 shadow-md">
                                    Confirm Update
                                </button>
                            </form>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Citizen Info</h2>
                            <div className="flex items-center gap-3">
                                <UserIcon className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{grievance.citizen.name}</p>
                                    <p className="text-xs text-slate-500">{grievance.citizen.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                                <MapPinIcon className="h-5 w-5 text-slate-400" />
                                <p className="text-sm text-slate-600">{grievance.address || "No address provided"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
