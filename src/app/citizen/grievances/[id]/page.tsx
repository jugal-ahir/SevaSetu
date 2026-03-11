import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowLeftIcon, MapPinIcon, CalendarIcon, UserIcon, ClockIcon, ExclamationTriangleIcon, CheckCircleIcon, DocumentIcon } from "@heroicons/react/24/outline";

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
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-100/40 blur-[100px]" />
            </div>

            <Navbar userRole={user.role} userName={user.name} />

            <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">

                <div className="mb-8">
                    <Link
                        href={user.role === "CITIZEN" ? "/citizen/grievances" : user.role === "OFFICER" ? "/officer/cases" : "/admin/grievances"}
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-4"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to List
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
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-slate-900 mb-2">
                                {grievance.title}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description & Details Card */}
                        <div className="rounded-3xl border border-slate-200/60 bg-white shadow-sm p-6 sm:p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-full -mr-10 -mt-10 pointer-events-none transition-colors group-hover:bg-blue-50/50"></div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-heading font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <DocumentIcon className="h-6 w-6 text-blue-500" />
                                    Issue Description
                                </h3>
                                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 mb-8 text-slate-700 leading-relaxed font-medium">
                                    {grievance.description}
                                </div>

                                {grievance.imageUrl && (
                                    <div className="mb-8 group/img relative overflow-hidden rounded-2xl border border-slate-200/60 shadow-sm">
                                        <div className="absolute inset-0 bg-blue-900/0 group-hover/img:bg-blue-900/10 transition-colors z-10 pointer-events-none"></div>
                                        <img
                                            src={grievance.imageUrl}
                                            alt="Grievance evidence"
                                            className="w-full object-cover max-h-[400px] transition-transform duration-500 group-hover/img:scale-105"
                                        />
                                    </div>
                                )}

                                <div className="grid gap-6 sm:grid-cols-2 pt-6 border-t border-slate-100">
                                    <InfoItem icon={<MapPinIcon className="h-6 w-6" />} label="Location Address" value={grievance.address || "No specific address provided"} />
                                    <InfoItem icon={<CalendarIcon className="h-6 w-6" />} label="Date Submitted" value={new Date(grievance.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />

                                    <div className="col-span-full grid sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Issue Category</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <p className="font-bold text-slate-900">{grievance.category}</p>
                                            </div>
                                        </div>
                                        {grievance.subcategory && (
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Subcategory</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                    <p className="font-bold text-slate-900">{grievance.subcategory}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {(grievance.latitude && grievance.longitude) && (
                                        <div className="col-span-full flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                                                <MapPinIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-emerald-700/80 mb-0.5">Verified GPS Coordinates</p>
                                                <p className="text-sm font-bold text-emerald-800">
                                                    {grievance.latitude.toFixed(5)}, {grievance.longitude.toFixed(5)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Status Timeline */}
                        <div className="rounded-3xl border border-slate-200/60 bg-white shadow-sm p-6 sm:p-8">
                            <h2 className="text-xl font-heading font-bold text-slate-900 mb-8 flex items-center gap-2">
                                <ClockIcon className="h-6 w-6 text-indigo-500" />
                                Lifecycle Timeline
                            </h2>
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                {grievance.history.map((entry, index) => {
                                    const isLatest = index === grievance.history.length - 1;
                                    return (
                                        <div key={entry.id} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                                                {isLatest ? (
                                                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-inner">
                                                        <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                                                    </div>
                                                ) : (
                                                    <div className="h-4 w-4 rounded-full bg-slate-300"></div>
                                                )}
                                            </div>

                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-white border border-slate-200/60 shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1 relative">
                                                {/* Connecting arrow for larger screens */}
                                                <div className="hidden md:block absolute top-[1.2rem] w-4 h-4 bg-white border-t border-r border-slate-200/60 rotate-45 transform 
                                                    group-odd:-left-2 group-odd:-rotate-135 group-odd:border-r-0 group-odd:border-b
                                                    group-even:-right-2 group-even:border-l-0 group-even:border-b-0"></div>

                                                <div className="flex flex-col gap-2 mb-3">
                                                    <div className="flex items-center justify-between">
                                                        <StatusBadge status={entry.toStatus} />
                                                        <span className="text-xs font-bold text-slate-400">
                                                            {new Date(entry.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-500">
                                                        {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                <p className="text-sm font-medium text-slate-700">
                                                    Updated by <span className="font-bold text-slate-900">{entry.changedBy?.name || "System Automated"}</span>
                                                </p>

                                                {entry.note && (
                                                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600 italic">
                                                        "{entry.note}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        {/* SLA / Deadline Status */}
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
                                        {new Date(grievance.slaDueAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </p>
                                    <p className={`text-sm font-bold ${new Date(grievance.slaDueAt) < new Date() ? "text-red-600" : "text-blue-600"
                                        }`}>
                                        {new Date(grievance.slaDueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {new Date(grievance.slaDueAt) < new Date() && " (SLA Overdue)"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Citizen Profile Card */}
                        <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Reporter Information</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 border border-blue-200/50 shadow-inner">
                                    <UserIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{grievance.citizen.name}</p>
                                    <p className="text-sm font-medium text-slate-500">{grievance.citizen.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Assignment Card */}
                        <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4"></div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 relative z-10">Assigned Official</h3>
                            {grievance.assignedTo ? (
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-purple-100 to-fuchsia-100 flex items-center justify-center text-purple-700 border border-purple-200/50 shadow-inner">
                                        <CheckCircleIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{grievance.assignedTo.name}</p>
                                        <p className="text-sm font-medium text-slate-500">{grievance.assignedTo.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-slate-500 p-3 rounded-xl bg-slate-50 border border-slate-100 relative z-10">
                                    <ClockIcon className="h-5 w-5" />
                                    <p className="text-sm font-medium">Pending assignment</p>
                                </div>
                            )}
                        </div>

                        {/* Organizational Details */}
                        <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Organizational Routing</h3>
                            <div className="space-y-4">
                                {grievance.department && (
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Department</p>
                                        <p className="font-bold text-slate-900">{grievance.department.name}</p>
                                    </div>
                                )}
                                {grievance.region && (
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Jurisdiction / Region</p>
                                        <p className="font-bold text-slate-900">{grievance.region.name}</p>
                                    </div>
                                )}
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

function InfoItem({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200 group">
            {icon && (
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                    {icon}
                </div>
            )}
            <div className="flex flex-col justify-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="font-bold text-slate-900 group-hover:text-blue-900 transition-colors">{value}</p>
            </div>
        </div>
    );
}
