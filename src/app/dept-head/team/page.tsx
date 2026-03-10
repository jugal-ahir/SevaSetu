import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { UserIcon, PhoneIcon, EnvelopeIcon, MapPinIcon } from "@heroicons/react/24/outline";

export default async function DeptHeadTeam() {
    const user = await getCurrentUser();

    if (!user || user.role !== "DEPT_HEAD" || !user.departmentId) {
        redirect("/login");
    }

    const officers = await prisma.user.findMany({
        where: {
            departmentId: user.departmentId,
            role: "OFFICER",
        },
        include: {
            _count: {
                select: { assignedGrievances: { where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } } } }
            },
            region: true,
        },
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[0%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-[100px]" />
            </div>

            <Navbar userRole="DEPT_HEAD" userName={user.name} />

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 mb-2">
                        Team Management
                    </h1>
                    <p className="text-lg text-slate-500 font-medium">
                        View and manage officers in your department
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {officers.map((officer) => (
                        <div key={officer.id} className="rounded-3xl border border-slate-200/60 bg-white p-6 sm:p-8 shadow-sm flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                            <div className="relative z-10 flex items-center gap-4 mb-6">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 border border-blue-200/50 shadow-inner group-hover:scale-110 transition-transform">
                                    <UserIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-heading font-bold text-slate-900">{officer.name}</h3>
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{officer.role.replace('_', ' ')}</p>
                                </div>
                            </div>

                            <div className="relative z-10 space-y-4 mb-8 flex-1">
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                                    {officer.email}
                                </div>
                                {officer.phone && (
                                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <PhoneIcon className="h-5 w-5 text-slate-400" />
                                        {officer.phone}
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <MapPinIcon className="h-5 w-5 text-slate-400" />
                                    <span>{officer.region?.name || "Unassigned Region"}</span>
                                </div>
                            </div>

                            <div className="relative z-10 border-t border-slate-100 pt-6 mt-auto">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Cases</span>
                                    <span className="rounded-full bg-blue-50 border border-blue-100 px-4 py-1.5 text-sm font-bold text-blue-700 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        {officer._count.assignedGrievances}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {officers.length === 0 && (
                        <div className="col-span-full py-20 text-center rounded-3xl border border-dashed border-slate-300 bg-white/50 backdrop-blur-sm shadow-sm">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-6 border border-slate-200 shadow-sm">
                                <UserIcon className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-heading font-bold text-slate-900 mb-2">No Officers Found</h3>
                            <p className="text-slate-500 font-medium max-w-md mx-auto">
                                There are currently no officers assigned to your department.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
