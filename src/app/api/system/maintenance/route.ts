import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: "MAINTENANCE_MODE" }
        });

        return NextResponse.json({
            maintenanceMode: setting?.value === "true"
        });
    } catch (error) {
        return NextResponse.json({ maintenanceMode: false });
    }
}
