import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: "MAINTENANCE_MODE" }
        });

        const user = await getCurrentUser();
        const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

        return NextResponse.json({
            maintenanceMode: setting?.value === "true",
            isAdmin
        });
    } catch (error) {
        return NextResponse.json({ maintenanceMode: false, isAdmin: false });
    }
}
