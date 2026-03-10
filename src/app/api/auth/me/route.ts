import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const full = searchParams.get("full") === "true";

        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (full) {
            const user = await prisma.user.findUnique({
                where: { id: currentUser.id },
                include: {
                    department: true,
                    region: true,
                    _count: {
                        select: {
                            grievances: true,
                            assignedGrievances: true
                        }
                    }
                }
            });
            return NextResponse.json(user);
        }

        return NextResponse.json({
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
            phone: currentUser.phone,
            twoFactorEnabled: currentUser.twoFactorEnabled,
            isVerified: currentUser.isVerified
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
