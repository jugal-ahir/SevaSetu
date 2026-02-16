import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
    ExclamationCircleIcon,
    CheckCircleIcon,
    ClockIcon,
    MapPinIcon
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
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole="OFFICER" userName={user.name} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Assigned Cases</h1>
                    <p className="mt-2 text-slate-600">Manage and update your assigned grievances</p>
                </div>

                <div className="space-y-4">
                    {cases.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                            <h3 className="mt-4 text-lg font-medium text-slate-900">All Caught Up!</h3>
                            <p className="mt-2 text-slate-600">You have no active cases assigned to you.</p>
                        </div>
                    ) : (
                        cases.map((grievance) => (
                            <Link
                                key={grievance.id}
                                href={`/officer/grievances/${grievance.id}`}
                                className="block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${grievance.status === "ESCALATED" ? "bg-red-100 text-red-800" :
                                                    grievance.status === "RESOLVED" ? "bg-green-100 text-green-800" :
                                                        "bg-blue-100 text-blue-800"
                                                }`}>
                                                {grievance.status}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                ID: {grievance.id.slice(0, 8)}
                                            </span>
                                        </div>
                                        <h3 className="mt-2 text-lg font-semibold text-slate-900">
                                            {grievance.title}
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                                            {grievance.description}
                                        </p>

                                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <ClockIcon className="h-4 w-4" />
                                                <span>Updated {new Date(grievance.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                            {grievance.region && (
                                                <div className="flex items-center gap-1">
                                                    <MapPinIcon className="h-4 w-4" />
                                                    <span>{grievance.region.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-slate-900">{grievance.citizen.name}</p>
                                            <p className="text-xs text-slate-500">{grievance.citizen.phone || "No phone"}</p>
                                        </div>
                                        {grievance.priority === "HIGH" && (
                                            <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                                                <ExclamationCircleIcon className="h-4 w-4" />
                                                High Priority
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
