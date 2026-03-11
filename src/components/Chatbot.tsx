"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
    ChatBubbleLeftRightIcon,
    XMarkIcon,
    PaperAirplaneIcon,
    SparklesIcon
} from "@heroicons/react/24/solid";

interface Message {
    role: "user" | "model";
    content: string;
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "model", content: "Hello! I am your SevaSetu assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage, currentPath: pathname }),
            });

            if (!response.ok) throw new Error("Failed to fetch response");

            const data = await response.json();
            setMessages(prev => [...prev, { role: "model", content: data.response }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: "model", content: "Sorry, I encountered an error. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center ${isOpen
                    ? "bg-slate-800 text-white hover:bg-slate-900 rotate-180"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/30"
                    }`}
            >
                {isOpen ? (
                    <XMarkIcon className="w-7 h-7" />
                ) : (
                    <ChatBubbleLeftRightIcon className="w-7 h-7" />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-[100] w-[calc(100%-2rem)] sm:w-[400px] bg-white/95 backdrop-blur-2xl border border-white/40 rounded-[2rem] shadow-2xl ring-1 ring-slate-900/5 animate-slide-up flex flex-col h-[500px] sm:h-[600px] max-h-[80vh] overflow-hidden">
                    {/* Header */}
                    <div className="relative shrink-0 bg-gradient-to-br from-blue-600 to-indigo-700 p-5 flex items-center justify-between overflow-hidden">
                        {/* Decorative background pattern removed per user request */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 blur-2xl rounded-full pointer-events-none"></div>

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="relative">
                                <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl ring-1 ring-white/30 text-yellow-300">
                                    <SparklesIcon className="w-6 h-6" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-emerald-400 border-2 border-indigo-700 rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="text-white font-heading font-black text-xl tracking-tight">SevaSahayak</h3>
                                <p className="text-blue-100/90 text-xs font-medium tracking-wide">AI-Powered Citizen Support</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="relative z-10 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all ring-1 ring-white/10"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        <div className="flex justify-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100/50 px-3 py-1 rounded-full">Today</span>
                        </div>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-sm flex flex-col gap-1 ${msg.role === "user"
                                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm"
                                        : "bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm"
                                        }`}
                                >
                                    {msg.role === "model" ? (
                                        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-a:text-blue-600 hover:prose-a:underline">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="font-medium">{msg.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="shrink-0 p-4 bg-white border-t border-slate-100/60 z-10">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me anything..."
                                className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none text-slate-800 placeholder:text-slate-400 font-medium"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="flex items-center justify-center p-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20 active:scale-95"
                            >
                                <PaperAirplaneIcon className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
