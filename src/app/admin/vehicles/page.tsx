import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import AdminVehiclesClient from "@/components/AdminVehiclesClient";
import { TruckIcon } from "@heroicons/react/24/outline";

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
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[0%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-100/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-teal-100/40 blur-[100px]" />
            </div>

            <Navbar userRole={user.role} userName={user.name} />

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 mb-2 flex items-center gap-3">
                        <TruckIcon className="h-8 w-8 text-emerald-600" />
                        Vehicle Fleet Management
                    </h1>
                    <p className="text-lg text-slate-500 font-medium ml-11">
                        Add, assign, and manage municipal tracking vehicles
                    </p>
                </div>

                <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm p-6 sm:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-bl-full pointer-events-none transition-colors"></div>
                    <div className="relative z-10">
                        <AdminVehiclesClient
                 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            initialVehicles={vehicles as any}
                            departments={departments}
                            createVehicleAction={createVehicle}
                            deleteVehicleAction={deleteVehicle}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
