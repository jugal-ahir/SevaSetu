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

        const updatedUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id },
                data: {
                    role,
                    departmentId,
                    regionId,
                    isVerified,
                },
            });

            // If the user's role is DEPT_HEAD and they have a department, 
            // ensure they are the head of that department
            if (role === "DEPT_HEAD" && departmentId) {
                // Remove them as head from any other department they might have headed
                await tx.department.updateMany({
                    where: { headId: id, NOT: { id: departmentId } },
                    data: { headId: null }
                });

                // Set them as head of the new department
                await tx.department.update({
                    where: { id: departmentId },
                    data: { headId: id }
                });
            } else if (role !== "DEPT_HEAD") {
                // If they are no longer a DEPT_HEAD, remove them from any department they head
                await tx.department.updateMany({
                    where: { headId: id },
                    data: { headId: null }
                });
            }

            return user;
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
