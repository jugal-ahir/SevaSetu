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

        const updatedDept = await prisma.$transaction(async (tx) => {
            const dept = await tx.department.update({
                where: { id },
                data: {
                    name,
                    description,
                    headId: headId || null,
                },
            });

            if (headId) {
                // Update the user's role and ENSURE their departmentId matches
                await tx.user.update({
                    where: { id: headId },
                    data: { 
                        role: "DEPT_HEAD",
                        departmentId: id 
                    }
                });
            }

            return dept;
        });

        return NextResponse.json(updatedDept);
    } catch (error: any) {
        console.error("Error updating department:", error);
        return NextResponse.json(
            { error: "Failed to update department" },
            { status: 500 }
        );
    }
}
