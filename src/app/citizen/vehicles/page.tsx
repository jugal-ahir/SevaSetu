import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import CitizenVehiclesClient from "@/components/CitizenVehiclesClient";

export default async function CitizenVehicles() {
    const user = await getCurrentUser();

    if (!user || user.role !== "CITIZEN") {
        redirect("/login");
    }

    const vehicles = await prisma.vehicle.findMany({
        where: { isActive: true },
        include: {
            department: { select: { name: true } },
            region: { select: { name: true } },
        },
        orderBy: { lastUpdatedAt: "desc" },
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole="CITIZEN" userName={user.name} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Track Vehicles</h1>
                    <p className="mt-2 text-slate-600">Real-time location of municipal service vehicles</p>
                </div>

                <CitizenVehiclesClient vehicles={vehicles as any} />
            </main>
        </div>
    );
}
