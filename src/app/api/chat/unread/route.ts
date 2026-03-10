import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const user = await getCurrentUser();

    if (!user || user.role === "CITIZEN") {
        return NextResponse.json({ unread: false });
    }

    const lastSeen = user.lastViewedChat || new Date(0);

    const unreadCount = await prisma.chatMessage.count({
        where: {
            createdAt: { gt: lastSeen },
            userId: { not: user.id }, // Don't count own messages
        },
    });

    return NextResponse.json({ unread: unreadCount > 0 });
}
