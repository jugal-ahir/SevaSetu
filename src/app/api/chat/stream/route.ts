import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { chatEmitter, CHAT_EVENT, VIDEO_CALL_EVENT } from "@/lib/chat-bus";

export async function GET() {
    const user = await getCurrentUser();

    if (!user || user.role === "CITIZEN") {
        return new Response("Unauthorized", { status: 401 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            let isStreamClosed = false;

            const safeSend = (data: string) => {
                if (isStreamClosed) return false;
                if (controller.desiredSize === null) {
                    isStreamClosed = true;
                    return false;
                }
                try {
                    controller.enqueue(encoder.encode(data));
                    return true;
                } catch (e) {
                    isStreamClosed = true;
                    return false;
                }
            };

            const onMessage = (message: any) => {
                if (!safeSend(`data: ${JSON.stringify(message)}\n\n`)) {
                    cleanup();
                }
            };

            const onVideoCall = (data: any) => {
                if (!safeSend(`data: ${JSON.stringify({ sseType: "video-call", ...data })}\n\n`)) {
                    cleanup();
                }
            };

            const heartbeat = setInterval(() => {
                if (!safeSend(": heartbeat\n\n")) {
                    cleanup();
                }
            }, 20000);

            const cleanup = () => {
                if (isStreamClosed) return;
                isStreamClosed = true;

                chatEmitter.off(CHAT_EVENT, onMessage);
                chatEmitter.off(VIDEO_CALL_EVENT, onVideoCall);
                clearInterval(heartbeat);

                try {
                    controller.close();
                } catch (e) {
                    // Ignore already closed errors
                }
            };

            chatEmitter.on(CHAT_EVENT, onMessage);
            chatEmitter.on(VIDEO_CALL_EVENT, onVideoCall);

            // Send initial connection event
            safeSend(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

            // Store cleanup for cancel event
            (this as any)._cleanup = cleanup;
        },
        cancel() {
            if ((this as any)._cleanup) (this as any)._cleanup();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
        },
    });
}
