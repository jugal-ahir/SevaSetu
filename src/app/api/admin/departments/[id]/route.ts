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
        const { name, description, headId } = body;

        const updatedDept = await prisma.department.update({
            where: { id },
            data: {
                name,
                description,
                headId: headId || null,
            },
        });

        // If a head is assigned, ensure they have at least DEPT_HEAD role?
        // Optional logic: if headId is set, upgrade user role to DEPT_HEAD if they are just OFFICER
        if (headId) {
            await prisma.user.update({
                where: { id: headId },
                data: { role: "DEPT_HEAD" }
            });
        }

        return NextResponse.json(updatedDept);
    } catch (error: any) {
        console.error("Error updating department:", error);
        return NextResponse.json(
            { error: "Failed to update department" },
            { status: 500 }
        );
    }
}
