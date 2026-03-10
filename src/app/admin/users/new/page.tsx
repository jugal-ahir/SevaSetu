import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import CreateUserForm from "./CreateUserForm";
import Link from "next/link";
import { ChevronLeftIcon, UserPlusIcon } from "@heroicons/react/24/outline";

export default async function AddNewUserPage() {
    const user = await getCurrentUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    const departments = await prisma.department.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
    });

    const regions = await prisma.region.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[0%] right-[0%] w-[50%] h-[50%] rounded-full bg-blue-100/30 blur-[120px]" />
            </div>

            <Navbar userRole={user.role} userName={user.name} />

            <main className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="mb-6">
                    <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200/60 shadow-sm w-fit">
                        <ChevronLeftIcon className="h-4 w-4" />
                        Back to User Matrix
                    </Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-slate-900 mb-2 flex items-center gap-3">
                        <UserPlusIcon className="h-8 w-8 text-blue-600" />
                        Provision Account
                    </h1>
                    <p className="text-lg text-slate-500 font-medium ml-11">
                        Create a new user identity and configure base permissions.
                    </p>
                </div>

                <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm p-6 sm:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-bl-full pointer-events-none transition-colors hidden sm:block"></div>
                    <div className="relative z-10">
                        <CreateUserForm
                            departments={departments}
                            regions={regions}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
