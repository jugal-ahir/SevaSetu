import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ChevronLeftIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";

export default async function AdminNewDepartment() {
    const user = await getCurrentUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    async function createDepartment(formData: FormData) {
        "use server";
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;

        if (!name) return;

        await prisma.department.create({
            data: { name, description },
        });
        redirect("/admin/departments");
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[0%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-100/30 blur-[120px]" />
            </div>

            <Navbar userRole={user.role} userName={user.name} />

            <main className="relative z-10 mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="mb-6">
                    <Link href="/admin/departments" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200/60 shadow-sm w-fit">
                        <ChevronLeftIcon className="h-4 w-4" />
                        Back to Departments Matrix
                    </Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-slate-900 mb-2 flex items-center gap-3">
                        <BuildingOffice2Icon className="h-8 w-8 text-indigo-600" />
                        Provision Department
                    </h1>
                    <p className="text-lg text-slate-500 font-medium ml-11">
                        Add a new operational unit to the municipal system
                    </p>
                </div>

                <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm p-6 sm:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full pointer-events-none"></div>

                    <form action={createDepartment} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Department Name *</label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none"
                                placeholder="e.g. Roads & Infrastructure"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Description</label>
                            <textarea
                                name="description"
                                rows={4}
                                className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none resize-none"
                                placeholder="Briefly describe the department role..."
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
                            <button type="submit" className="sm:flex-1 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 font-bold text-white shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all outline-none focus:ring-4 focus:ring-indigo-500/20">
                                Create Department
                            </button>
                            <Link href="/admin/departments" className="sm:flex-1 w-full rounded-xl border border-slate-300 bg-white px-6 py-4 font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-center transition-all outline-none">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
