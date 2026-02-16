import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import AdminVehiclesClient from "@/components/AdminVehiclesClient";

export default async function AdminVehicles() {
    const user = await getCurrentUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    const vehicles = await prisma.vehicle.findMany({
        include: {
            department: { select: { name: true } },
            region: { select: { name: true } },
        },
        orderBy: { registrationNumber: "asc" },
    });

    const departments = await prisma.department.findMany({
        select: { id: true, name: true },
    });

    async function createVehicle(formData: FormData) {
        "use server";
        const registrationNumber = formData.get("registrationNumber") as string;
        const type = formData.get("type") as string;
        const departmentId = formData.get("departmentId") as string;

        if (!registrationNumber || !type) return;

        await prisma.vehicle.create({
            data: {
                registrationNumber,
                type,
                departmentId: departmentId || null,
            },
        });
        redirect("/admin/vehicles");
    }

    async function deleteVehicle(formData: FormData) {
        "use server";
        const vehicleId = formData.get("vehicleId") as string;
        await prisma.vehicle.delete({ where: { id: vehicleId } });
        redirect("/admin/vehicles");
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole={user.role} userName={user.name} />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Vehicle Management</h1>
                    <p className="mt-2 text-slate-600">Add and manage municipal fleet tracking</p>
                </div>

                <AdminVehiclesClient
                    initialVehicles={vehicles as any}
                    departments={departments}
                    createVehicleAction={createVehicle}
                    deleteVehicleAction={deleteVehicle}
                />
            </main>
        </div>
    );
}
