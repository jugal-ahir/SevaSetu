import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import ChatPage from "./ChatPage";

export default async function Page() {
    const user = await getCurrentUser();

    if (!user || user.role === "CITIZEN") {
        redirect("/login");
    }

    // Fetch all staff users for tagging suggestions
    const staffUsers = await prisma.user.findMany({
        where: {
            role: {
                not: "CITIZEN"
            }
        },
        select: {
            id: true,
            name: true,
            role: true
        }
    });

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50/50">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-blue-200/5 blur-[130px] rounded-full animate-pulse-subtle"></div>
                <div className="absolute bottom-[-5%] left-[-5%] w-[45%] h-[45%] bg-indigo-200/5 blur-[130px] rounded-full animate-pulse-subtle" style={{ animationDelay: '4s' }}></div>
            </div>

            <Navbar userRole={user.role} userName={user.name} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 animate-fade-up">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Team <span className="gradient-text">Chat</span></h1>
                    </div>
                    <p className="text-slate-500 font-bold text-sm tracking-wide uppercase px-1">
                        Authoritative communication channel for <span className="text-blue-600">{user.role.replace("_", " ")}</span> hierarchy
                    </p>
                </div>

                <ChatPage
                    currentUser={{ id: user.id, name: user.name, role: user.role }}
                    staffUsers={staffUsers}
                />
            </main>
        </div>
    );
}
