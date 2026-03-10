import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatEmitter, CHAT_EVENT } from "@/lib/chat-bus";
import { z } from "zod";

const messageSchema = z.object({
    content: z.string().min(1).max(1000),
});

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role === "CITIZEN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = messageSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid content" }, { status: 400 });
        }

        const message = await prisma.chatMessage.create({
            data: {
                content: parsed.data.content,
                userId: user.id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },
        });

        // Broadcast to all SSE listeners
        chatEmitter.emit(CHAT_EVENT, message);

        return NextResponse.json(message);
    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}
