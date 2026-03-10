import { EventEmitter } from "events";

// Global singleton for chat events
// In a serverless/lambda environment (like standard Vercel), this only works 
// within the same instance. For a local dev or persistent server, it works across all connections.
class ChatEmitter extends EventEmitter { }

// Use a global variable to ensure the emitter survives HMR in development
const globalForChat = global as unknown as { chatEmitter: ChatEmitter };

export const chatEmitter = globalForChat.chatEmitter || new ChatEmitter();

if (process.env.NODE_ENV !== "production") {
    globalForChat.chatEmitter = chatEmitter;
}

export const CHAT_EVENT = "new-message";
export const VIDEO_CALL_EVENT = "video-call";
