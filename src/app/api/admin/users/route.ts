import { NextResponse } from "next/server";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createUserSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["CITIZEN", "OFFICER", "DEPT_HEAD", "ADMIN", "SUPER_ADMIN"]),
    departmentId: z.string().optional().nullable(),
    regionId: z.string().optional().nullable(),
    isVerified: z.boolean().default(false),
});

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();

        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = createUserSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid data", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { name, email, password, role, departmentId, regionId, isVerified } = parsed.data;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 409 }
            );
        }

        const passwordHash = await hashPassword(password);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role,
                departmentId,
                regionId,
                isVerified,
            },
        });

        // Remove passwordHash from response
        const { passwordHash: _, ...userWithoutPassword } = newUser;

        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error: any) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}
