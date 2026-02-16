import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";

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
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole={user.role} userName={user.name} />

            <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Create New Department</h1>
                    <p className="mt-2 text-slate-600">Add a new municipal department to the system</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <form action={createDepartment} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Department Name *</label>
                            <input name="name" type="text" required className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:ring-blue-500" placeholder="e.g. Roads & Infrastructure" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea name="description" rows={4} className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:ring-blue-500" placeholder="Briefly describe the department role..." />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="submit" className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-all active:scale-[0.98]">
                                Create Department
                            </button>
                            <Link href="/admin/departments" className="flex-1 rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 text-center transition-all">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
