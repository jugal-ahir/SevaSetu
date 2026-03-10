import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, verifyPassword, hashPassword } from "@/lib/auth";
import { z } from "zod";

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
});

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = changePasswordSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid data", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { currentPassword, newPassword } = parsed.data;

        // Verify current password
        const isValid = await verifyPassword(currentPassword, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
        }

        // Hash and update new password
        const newPasswordHash = await hashPassword(newPassword);
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newPasswordHash },
        });

        // Log the action
        await prisma.auditLog.create({
            data: {
                actorId: user.id,
                action: "UPDATE_USER",
                entity: "User",
                entityId: user.id,
                metadata: JSON.stringify({ action: "CHANGE_PASSWORD" }),
            },
        });

        return NextResponse.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Change password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
