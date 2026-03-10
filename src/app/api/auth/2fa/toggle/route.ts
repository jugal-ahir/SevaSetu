import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { enabled } = body;

        await prisma.user.update({
            where: { id: user.id },
            data: {
                twoFactorEnabled: enabled,
                twoFactorSecret: null // Clear secret when toggling
            },
        });

        // Log action
        await prisma.auditLog.create({
            data: {
                actorId: user.id,
                action: "UPDATE_USER",
                entity: "User",
                entityId: user.id,
                metadata: JSON.stringify({ action: "TOGGLE_2FA", enabled }),
            },
        });

        return NextResponse.json({
            success: true,
            message: `2FA ${enabled ? "enabled" : "disabled"} successfully`
        });
    } catch (error) {
        console.error("2FA toggle error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
