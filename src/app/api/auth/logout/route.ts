import { NextResponse } from "next/server";
import { clearAuthCookie, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
    try {
        const user = await getCurrentUser();

        if (user) {
            // Log logout action
            await prisma.auditLog.create({
                data: {
                    actorId: user.id,
                    action: "LOGOUT",
                    entity: "User",
                    entityId: user.id,
                },
            });
        }

        await clearAuthCookie();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ success: true }); // Always succeed for logout
    }
}
