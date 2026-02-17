import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { role, departmentId, regionId, isVerified } = body;

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                role,
                departmentId,
                regionId,
                isVerified,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}
