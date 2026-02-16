import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowLeftIcon, MapPinIcon, CalendarIcon, UserIcon, ClockIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default async function GrievanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const { id } = await params;

    const grievance = await prisma.grievance.findUnique({
        where: { id },
        include: {
            citizen: { select: { name: true, email: true, phone: true } },
            assignedTo: { select: { name: true, email: true } },
            department: { select: { name: true } },
            region: { select: { name: true } },
            history: {
                orderBy: { createdAt: "asc" },
                include: {
                    changedBy: { select: { name: true } },
                },
            },
        },
    });

    if (!grievance) {
        notFound();
    }

    // Check access permissions
    const canView =
        user.role === "ADMIN" ||
        user.role === "SUPER_ADMIN" ||
        (user.role === "CITIZEN" && grievance.citizenId === user.id) ||
        (user.role === "OFFICER" && grievance.assignedToId === user.id) ||
        (user.role === "DEPT_HEAD" && grievance.departmentId === user.departmentId);

    if (!canView) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole={user.role} userName={user.name} />

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <Link
                    href={user.role === "CITIZEN" ? "/citizen/grievances" : user.role === "OFFICER" ? "/officer/cases" : "/admin/grievances"}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to list
                </Link>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">{grievance.title}</h1>
                                    <p className="mt-1 text-sm text-slate-500">
                                        ID: {grievance.id.slice(0, 8)}...
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <StatusBadge status={grievance.status} />
                                    {grievance.priority === "URGENT" && (
                                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-700 uppercase tracking-wider animate-pulse">
                                            <ExclamationTriangleIcon className="h-3 w-3" />
                                            Urgent Escalation
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-700 mb-2">Description</h3>
                                    <p className="text-slate-600">{grievance.description}</p>
                                </div>

                                {grievance.imageUrl && (
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-700 mb-2">Attached Image</h3>
                                        <img
                                            src={grievance.imageUrl}
                                            alt="Grievance"
                                            className="rounded-lg border border-slate-200 max-w-md"
                                        />
                                    </div>
                                )}

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <InfoItem icon={<MapPinIcon className="h-5 w-5" />} label="Address" value={grievance.address || "N/A"} />
                                    <InfoItem icon={<CalendarIcon className="h-5 w-5" />} label="Submitted" value={new Date(grievance.createdAt).toLocaleDateString()} />
                                    <InfoItem label="Category" value={grievance.category} />
                                    {grievance.subcategory && <InfoItem label="Subcategory" value={grievance.subcategory} />}
                                    {grievance.slaDueAt && (
                                        <div className={`flex items-start gap-2 rounded-xl p-3 ${new Date(grievance.slaDueAt) < new Date() ? "bg-red-50 border border-red-100" : "bg-blue-50 border border-blue-100"}`}>
                                            <ClockIcon className={`h-5 w-5 mt-0.5 ${new Date(grievance.slaDueAt) < new Date() ? "text-red-600" : "text-blue-600"}`} />
                                            <div>
                                                <p className="text-xs text-slate-500">Resolution Deadline</p>
                                                <p className={`text-sm font-bold ${new Date(grievance.slaDueAt) < new Date() ? "text-red-700" : "text-blue-700"}`}>
                                                    {new Date(grievance.slaDueAt).toLocaleString()}
                                                    {new Date(grievance.slaDueAt) < new Date() && " (Overdue)"}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {(grievance.latitude && grievance.longitude) && (
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-700 mb-2">Location</h3>
                                        <p className="text-sm text-slate-600">
                                            📍 {grievance.latitude.toFixed(4)}, {grievance.longitude.toFixed(4)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Status Timeline</h2>
                            <div className="space-y-4">
                                {grievance.history.map((entry, index) => (
                                    <div key={entry.id} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${index === grievance.history.length - 1 ? "bg-blue-600" : "bg-slate-300"
                                                }`}>
                                                <div className="h-2 w-2 rounded-full bg-white" />
                                            </div>
                                            {index < grievance.history.length - 1 && (
                                                <div className="h-full w-0.5 bg-slate-200 flex-1 mt-2" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-8">
                                            <div className="flex items-center gap-2">
                                                <StatusBadge status={entry.toStatus} />
                                                <span className="text-xs text-slate-500">
                                                    {new Date(entry.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-slate-600">
                                                Updated by {entry.changedBy?.name || "System"}
                                            </p>
                                            {entry.note && (
                                                <p className="mt-2 text-sm text-slate-700 bg-slate-50 rounded-lg p-3">
                                                    {entry.note}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Citizen Info */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-sm font-medium text-slate-700 mb-4">Submitted By</h3>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <UserIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">{grievance.citizen.name}</p>
                                    <p className="text-sm text-slate-500">{grievance.citizen.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Assignment Info */}
                        {grievance.assignedTo && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h3 className="text-sm font-medium text-slate-700 mb-4">Assigned To</h3>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                        <UserIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{grievance.assignedTo.name}</p>
                                        <p className="text-sm text-slate-500">{grievance.assignedTo.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Department & Region */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-sm font-medium text-slate-700 mb-4">Details</h3>
                            <div className="space-y-3">
                                {grievance.department && (
                                    <div>
                                        <p className="text-xs text-slate-500">Department</p>
                                        <p className="font-medium text-slate-900">{grievance.department.name}</p>
                                    </div>
                                )}
                                {grievance.region && (
                                    <div>
                                        <p className="text-xs text-slate-500">Region</p>
                                        <p className="font-medium text-slate-900">{grievance.region.name}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-slate-500">Priority</p>
                                    <p className="font-medium text-slate-900">{grievance.priority}</p>
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
        SUBMITTED: { label: "Submitted", className: "bg-blue-100 text-blue-700" },
        ASSIGNED: { label: "Assigned", className: "bg-purple-100 text-purple-700" },
        IN_PROGRESS: { label: "In Progress", className: "bg-amber-100 text-amber-700" },
        RESOLVED: { label: "Resolved", className: "bg-green-100 text-green-700" },
        CLOSED: { label: "Closed", className: "bg-slate-100 text-slate-700" },
        ESCALATED: { label: "Escalated", className: "bg-red-100 text-red-700" },
    };

    const config = statusConfig[status] || statusConfig.SUBMITTED;

    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${config.className}`}>
            {config.label}
        </span>
    );
}

function InfoItem({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-2">
            {icon && <div className="text-slate-400 mt-0.5">{icon}</div>}
            <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-medium text-slate-900">{value}</p>
            </div>
        </div>
    );
}
