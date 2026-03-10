import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
    const user = await getCurrentUser();

    if (!user || user.role === "CITIZEN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { lastViewedChat: new Date() },
    });

    return NextResponse.json({ success: true });
}
