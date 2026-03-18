"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import {
    PaperAirplaneIcon,
    UserCircleIcon,
    AtSymbolIcon,
    VideoCameraIcon,
    PhoneIcon,
    XMarkIcon,
    MicrophoneIcon,
    VideoCameraSlashIcon,
} from "@heroicons/react/24/solid";
import { clsx } from "clsx";

interface User {
    id: string;
    name: string;
    role: string;
}

interface Message {
    id: string;
    content: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        role: string;
    };
}

interface CallData {
    type: "START" | "STOP";
    callerId: string;
    callerName: string;
    roomId: string;
    timestamp: string;
}

interface ChatPageProps {
    currentUser: User;
    staffUsers: User[];
}

export default function ChatPage({ currentUser, staffUsers }: ChatPageProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isPending, startTransition] = useTransition();
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mentionFilter, setMentionFilter] = useState("");

    // Video Call States
    const [activeCall, setActiveCall] = useState<CallData | null>(null);
    const [isInCall, setIsInCall] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);

    // Multi-participant states
    const [remoteStreams, setRemoteStreams] = useState<Map<string, { stream: MediaStream; name: string }>>(new Map());
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);

    // WebRTC Configuration
    const rtcConfig = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    };

                 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sendSignal = async (type: string, data: any = {}) => {
        await fetch("/api/chat/video", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, type, roomId: activeCall?.roomId }),
        });
    };

    const createPeerConnection = (peerId: string, peerName: string, isInitiator: boolean) => {
        if (peerConnections.current.has(peerId)) return peerConnections.current.get(peerId)!;

        const pc = new RTCPeerConnection(rtcConfig);
        peerConnections.current.set(peerId, pc);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal("SIGNAL", { targetId: peerId, signalData: { candidate: event.candidate } });
            }
        };

        pc.ontrack = (event) => {
            setRemoteStreams(prev => {
                const next = new Map(prev);
                next.set(peerId, { stream: event.streams[0], name: peerName });
                return next;
            });
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
                removePeer(peerId);
            }
        };

        if (localStream) {
            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
        }

        if (isInitiator) {
            pc.createOffer().then(offer => {
                pc.setLocalDescription(offer);
                sendSignal("SIGNAL", { targetId: peerId, signalData: { sdp: offer } });
            });
        }

        return pc;
    };

    const removePeer = (peerId: string) => {
        const pc = peerConnections.current.get(peerId);
        if (pc) {
            pc.close();
            peerConnections.current.delete(peerId);
        }
        setRemoteStreams(prev => {
            const next = new Map(prev);
            next.delete(peerId);
            return next;
        });
    };

    // Initial fetch and Real-time SSE setup
    useEffect(() => {
        // Fetch history
        fetch("/api/chat/messages")
            .then(res => res.json())
            .then(data => setMessages(data));

        // Mark as seen
        fetch("/api/chat/seen", { method: "POST" });

        // SSE connection
        const eventSource = new EventSource("/api/chat/stream");

        eventSource.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            // Handle Chat Messages
            if (data.id && !data.sseType) {
                setMessages(prev => {
                    if (prev.find(m => m.id === data.id)) return prev;
                    return [...prev, data];
                });
            }

            // Handle Video Call Signaling
            if (data.sseType === "video-call") {
                const { type, callerId, callerName, targetId, signalData } = data;

                switch (type) {
                    case "START":
                        setActiveCall(data);
                        break;
                    case "STOP":
                        setActiveCall(null);
                        handleEndCall();
                        break;
                    case "JOIN":
                        // When someone joins, if we are in call, we initiate P2P with them
                        if (isInCall && callerId !== currentUser.id) {
                            createPeerConnection(callerId, callerName, true);
                        }
                        break;
                    case "SIGNAL":
                        // Handle WebRTC signaling messages
                        if (targetId === currentUser.id) {
                            let pc = peerConnections.current.get(callerId);
                            if (!pc) pc = createPeerConnection(callerId, callerName, false);

                            if (signalData.sdp) {
                                await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
                                if (signalData.sdp.type === "offer") {
                                    const answer = await pc.createAnswer();
                                    await pc.setLocalDescription(answer);
                                    sendSignal("SIGNAL", { targetId: callerId, signalData: { sdp: answer } });
                                }
                            } else if (signalData.candidate) {
                                await pc.addIceCandidate(new RTCIceCandidate(signalData.candidate));
                            }
                        }
                        break;
                }
            }
        };

        eventSource.onerror = (err) => {
            console.error("SSE Error:", err);
            eventSource.close();
        };

        return () => eventSource.close();
    }, [currentUser.id, isInCall, localStream, activeCall?.roomId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    const handleStartMeeting = async () => {
        try {
            const res = await fetch("/api/chat/video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "START" }),
            });
            if (res.ok) {
                // If successful, the host immediately joins the feed
                await handleAcceptCall();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to start meeting");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAcceptCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            setIsInCall(true);
            // Notify others that we joined
            await fetch("/api/chat/video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "JOIN", roomId: activeCall?.roomId }),
            });
        } catch (err) {
            alert("Could not access camera/microphone");
            console.error(err);
        }
    };

    const handleEndCall = useCallback(() => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        setIsInCall(false);
        // Close all peer connections
        peerConnections.current.forEach(pc => pc.close());
        peerConnections.current.clear();
        setRemoteStreams(new Map());

        // If caller (SUPER_ADMIN) ends, we notify server
        if (currentUser.role === "SUPER_ADMIN") {
            fetch("/api/chat/video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "STOP" }),
            });
        }
    }, [localStream, currentUser.role]);

    const toggleMic = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(t => t.enabled = !isMicOn);
            setIsMicOn(!isMicOn);
        }
    };

    const toggleCam = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(t => t.enabled = !isCamOn);
            setIsCamOn(!isCamOn);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isPending) return;

        const content = inputValue;
        setInputValue("");
        setShowSuggestions(false);

        startTransition(async () => {
            try {
                const res = await fetch("/api/chat/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content }),
                });
                if (!res.ok) throw new Error("Failed to send");
            } catch (err) {
                console.error(err);
            }
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInputValue(value);

        const cursorPosition = e.target.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPosition);
        const atIndex = textBeforeCursor.lastIndexOf("@");

        if (atIndex !== -1 && (atIndex === 0 || textBeforeCursor[atIndex - 1] === " ")) {
            const filter = textBeforeCursor.substring(atIndex + 1);
            if (!filter.includes(" ")) {
                setMentionFilter(filter.toLowerCase());
                setShowSuggestions(true);
                return;
            }
        }
        setShowSuggestions(false);
    };

    const insertMention = (userName: string) => {
        const cursorPosition = inputRef.current?.selectionStart || 0;
        const textBeforeCursor = inputValue.substring(0, cursorPosition);
        const textAfterCursor = inputValue.substring(cursorPosition);
        const atIndex = textBeforeCursor.lastIndexOf("@");

        const newValue =
            textBeforeCursor.substring(0, atIndex) +
            "@" + userName + " " +
            textAfterCursor;

        setInputValue(newValue);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const renderContent = (content: string) => {
        const parts = content.split(/(@\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith("@")) {
                return <span key={i} className="font-bold text-blue-600 bg-blue-50 px-1 rounded-md">{part}</span>;
            }
            return part;
        });
    };

    const filteredUsers = staffUsers.filter(u =>
        u.name.toLowerCase().includes(mentionFilter)
    ).slice(0, 5);

    return (
        <div className="flex flex-col h-[calc(100vh-14rem)] bg-white/40 backdrop-blur-2xl rounded-[2rem] border border-white/60 shadow-2xl shadow-blue-500/5 overflow-hidden relative animate-fade-up">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-white/20 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse" />
                            Operation Center
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Real-time Coordination Channel</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {currentUser.role === "SUPER_ADMIN" && (
                        <button
                            onClick={handleStartMeeting}
                            disabled={!!activeCall}
                            className="flex items-center gap-2 bg-gradient-to-br from-blue-600 to-indigo-600 px-4 py-2 rounded-xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                        >
                            <VideoCameraIcon className="h-4 w-4" />
                            {activeCall ? "Broadcasting" : "Start Meet"}
                        </button>
                    )}

                    <div className="flex -space-x-2">
                        {staffUsers.slice(0, 4).map(u => (
                            <div key={u.id} className="h-9 w-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-600 uppercase shadow-sm" title={u.name}>
                                {u.name.charAt(0)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <PaperAirplaneIcon className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Secure Line Established</h3>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isOwn = msg.user.id === currentUser.id;
                        return (
                            <div key={msg.id} className={clsx("flex gap-4 animate-fade-up", isOwn ? "flex-row-reverse" : "flex-row")} style={{ animationDelay: `${idx * 0.05}s` }}>
                                <div className="flex-shrink-0 h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm mt-1">
                                    <span className="text-xs font-black text-slate-400">{msg.user.name.charAt(0)}</span>
                                </div>
                                <div className={clsx("max-w-[75%] space-y-1.5", isOwn ? "items-end text-right" : "items-start text-left")}>
                                    <div className={clsx("flex items-center gap-2 mb-0.5", isOwn ? "flex-row-reverse" : "flex-row")}>
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{msg.user.name}</span>
                                        <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border border-blue-100/50">{msg.user.role.replace("_", " ")}</span>
                                    </div>
                                    <div className={clsx(
                                        "p-4 rounded-2xl text-sm transition-all hover:shadow-lg",
                                        isOwn ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none shadow-blue-500/20" : "bg-white/80 backdrop-blur-md text-slate-700 rounded-tl-none border border-slate-100 shadow-sm"
                                    )}>
                                        <div className="leading-relaxed font-medium">{renderContent(msg.content)}</div>
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter block mt-1 px-1">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Overlay for Suggestions */}
            <div className="px-6 relative">
                {showSuggestions && filteredUsers.length > 0 && (
                    <div className="absolute bottom-full left-6 mb-4 w-72 bg-white/90 backdrop-blur-2xl border border-slate-200/60 rounded-3xl shadow-2xl overflow-hidden p-2 z-50 animate-in slide-in-from-bottom-4 zoom-in-95 duration-200">
                        <div className="px-3 py-2 border-b border-slate-100 mb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tag Personnel</span>
                        </div>
                        {filteredUsers.map(u => (
                            <button
                                key={u.id}
                                onClick={() => insertMention(u.name)}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-blue-50 text-left transition-all group"
                            >
                                <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 group-hover:bg-white group-hover:border-blue-200 transition-colors">
                                    {u.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">{u.name}</span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{u.role}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Input Field */}
            <div className="p-6 bg-white/20 border-t border-slate-100 backdrop-blur-md">
                <form onSubmit={handleSendMessage} className="relative group">
                    <textarea
                        ref={inputRef}
                        rows={1}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder="Transmit your message... (use @ to tag)"
                        className="w-full bg-white/50 border border-slate-200/60 rounded-[1.25rem] px-6 py-5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all pr-16 resize-none shadow-sm"
                    />
                    <button type="submit" disabled={!inputValue.trim() || isPending} className="absolute right-2.5 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-50">
                        {isPending ? <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <PaperAirplaneIcon className="h-5 w-5" />}
                    </button>
                </form>
            </div>

            {/* Incoming Meeting Invitation */}
            {activeCall && !isInCall && activeCall.callerId !== currentUser.id && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-sm w-full text-center space-y-8 border border-white/20 scale-100 animate-in zoom-in-95 duration-300">
                        <div className="relative inline-block">
                            <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto ring-8 ring-blue-50">
                                <VideoCameraIcon className="h-12 w-12 text-blue-600 animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Meeting Invite</h3>
                            <p className="text-sm font-medium text-slate-500 mt-2"><span className="font-black text-blue-600">{activeCall.callerName}</span> is starting a video coordination session.</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setActiveCall(null)} className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Decline</button>
                            <button onClick={handleAcceptCall} className="flex-1 px-6 py-4 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20">Accept</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Multi-Participant Video Call Overlay */}
            {isInCall && (
                <div className="absolute inset-0 bg-slate-950 z-[200] flex flex-col p-6 space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    {/* Participant Grid (Google Meet Style) */}
                    <div className={clsx(
                        "flex-1 grid gap-6",
                        (remoteStreams.size + 1) === 1 && "grid-cols-1",
                        (remoteStreams.size + 1) === 2 && "grid-cols-2",
                        (remoteStreams.size + 1) >= 3 && "grid-cols-2 md:grid-cols-3"
                    )}>
                        {/* Local Feed */}
                        <div className="bg-slate-900/50 rounded-3xl border border-white/5 relative overflow-hidden group shadow-2xl">
                            <video ref={localVideoRef} autoPlay playsInline muted className={clsx("h-full w-full object-cover transition-opacity duration-500", !isCamOn && "opacity-0")} />
                            {!isCamOn && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-24 w-24 rounded-full bg-slate-800 flex items-center justify-center text-3xl font-black text-white border border-white/10 uppercase">{currentUser.name.charAt(0)}</div>
                                </div>
                            )}
                            <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">You</span>
                            </div>
                        </div>

                        {/* Remote Feeds */}
                        {Array.from(remoteStreams.entries()).map(([peerId, { stream, name }]) => (
                            <RemoteVideo key={peerId} stream={stream} name={name} />
                        ))}
                    </div>

                    {/* Controls Footer */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-6 flex items-center justify-between shadow-2xl shadow-black/50">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Secure Link: {activeCall?.roomId}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button onClick={toggleMic} className={clsx("h-16 w-16 rounded-3xl flex items-center justify-center transition-all hover:scale-110 active:scale-90", isMicOn ? "bg-white/10 text-white hover:bg-white/20 border border-white/10" : "bg-red-500/20 text-red-500 border border-red-500/30")}>
                                {isMicOn ? <MicrophoneIcon className="h-7 w-7" /> : <XMarkIcon className="h-7 w-7" />}
                            </button>
                            <button onClick={toggleCam} className={clsx("h-16 w-16 rounded-3xl flex items-center justify-center transition-all hover:scale-110 active:scale-90", isCamOn ? "bg-white/10 text-white hover:bg-white/20 border border-white/10" : "bg-red-500/20 text-red-500 border border-red-500/30")}>
                                {isCamOn ? <VideoCameraIcon className="h-7 w-7" /> : <VideoCameraSlashIcon className="h-7 w-7" />}
                            </button>
                            <button onClick={handleEndCall} className="h-16 w-32 rounded-3xl bg-red-600 flex items-center justify-center text-white hover:bg-red-700 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-red-500/30 group">
                                <PhoneIcon className="h-7 w-7 rotate-[135deg] group-hover:-rotate-[135deg] transition-transform duration-500" />
                            </button>
                        </div>

                        <div className="flex -space-x-3">
                            <div className="h-10 w-10 rounded-full bg-blue-600 border-2 border-slate-950 flex items-center justify-center text-[10px] font-black text-white shadow-lg">+{remoteStreams.size}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-component for Remote Video
function RemoteVideo({ stream, name }: { stream: MediaStream; name: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
    }, [stream]);

    return (
        <div className="bg-slate-900/50 rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl animate-in fade-in duration-500">
            <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
            <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{name}</span>
            </div>
        </div>
    );
}
