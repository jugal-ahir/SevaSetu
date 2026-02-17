import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import EditUserForm from "./EditUserForm";

interface EditUserPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    const userToEdit = await prisma.user.findUnique({
        where: { id },
    });

    if (!userToEdit) {
        notFound();
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
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole={currentUser.role} userName={currentUser.name} />

            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Edit User</h1>
                    <p className="mt-2 text-slate-600">Update user details, role, and assignment.</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <EditUserForm
                        user={userToEdit}
                        departments={departments}
                        regions={regions}
                    />
                </div>
            </main>
        </div>
    );
}
