import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuthToken, setAuthCookie } from "@/lib/auth";
import { z } from "zod";

const verifySchema = z.object({
    userId: z.string(),
    otp: z.string().length(6),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = verifySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const { userId, otp } = parsed.data;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.twoFactorEnabled) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        // Verify OTP (stored in twoFactorSecret temporarily)
        if (user.twoFactorSecret !== otp) {
            return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
        }

        // Clear the OTP
        await prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: null }
        });

        // Create token and set cookie
        const token = await createAuthToken({
            sub: user.id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
        });
        await setAuthCookie(token);

        // Log login action
        await prisma.auditLog.create({
            data: {
                actorId: user.id,
                action: "LOGIN",
                entity: "User",
                entityId: user.id,
                metadata: JSON.stringify({ method: "2FA" }),
            },
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
            },
        });
    } catch (error) {
        console.error("2FA verify error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
