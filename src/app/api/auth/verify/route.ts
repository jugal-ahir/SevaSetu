import { NextResponse } from "next/server";
import { getCurrentUser, createAuthToken, setAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifySchema = z.object({
    nationalId: z.string().min(12, "Aadhar number must be at least 12 digits").max(14),
    dob: z.string().min(1),
});

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (user.isVerified) {
            return NextResponse.json({ error: "Already verified" }, { status: 400 });
        }

        const body = await req.json();
        const parsed = verifySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid data", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { nationalId, dob } = parsed.data;

        // 1. Validate against pre-saved database (VerificationDataset)
        const validRecord = await prisma.verificationDataset.findUnique({
            where: { nationalId },
        });

        if (!validRecord) {
            return NextResponse.json(
                { error: "Invalid Aadhar card number. Not found in records." },
                { status: 400 }
            );
        }

        // 2. Check if date of birth matches (optional but recommended)
        const inputDob = new Date(dob).toISOString().split('T')[0];
        const recordDob = new Date(validRecord.dob).toISOString().split('T')[0];

        if (inputDob !== recordDob) {
            return NextResponse.json(
                { error: "Date of birth does not match our records for this Aadhar number." },
                { status: 400 }
            );
        }

        // 3. Check if this Aadhar is already verified by another user
        const existingUser = await prisma.user.findUnique({
            where: { nationalId },
        });

        if (existingUser && existingUser.id !== user.id) {
            return NextResponse.json(
                { error: "This Aadhar card is already verified by another user." },
                { status: 400 }
            );
        }

        // 4. Update user as verified and store nationalId
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                nationalId: nationalId
            },
        });

        // 5. IMPORTANT: Update the JWT token to include isVerified: true
        // This solves the "stuck" URL/redirection loop bug
        const token = await createAuthToken({
            sub: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role,
            isVerified: true,
        });

        await setAuthCookie(token);

        // Log verification action
        await prisma.auditLog.create({
            data: {
                actorId: user.id,
                action: "VERIFY_IDENTITY",
                entity: "User",
                entityId: user.id,
                metadata: JSON.stringify({ nationalId }),
            },
        });

        return NextResponse.json({
            success: true,
            message: "Identity verified successfully"
        });
    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
