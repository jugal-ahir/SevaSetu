"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    HomeIcon,
    DocumentTextIcon,
    MapIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    BuildingOfficeIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    Bars3Icon,
    XMarkIcon,
    ChevronDownIcon,
    BellIcon
} from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";

interface NavbarProps {
    userRole: "CITIZEN" | "OFFICER" | "DEPT_HEAD" | "ADMIN" | "SUPER_ADMIN";
    userName: string;
}

export default function Navbar({ userRole, userName }: NavbarProps) {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [systemMenuOpen, setSystemMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const systemMenuRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login?noAnim=true");
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (systemMenuRef.current && !systemMenuRef.current.contains(event.target as Node)) {
                setSystemMenuOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch("/api/notifications");
                const data = await res.json();
                if (data.notifications) {
                    setNotifications(data.notifications);
                    setUnreadCount(data.unreadCount);
                }
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            }
        };
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id?: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (id) {
                setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } else {
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    };

    const getNavItems = () => {
        switch (userRole) {
            case "CITIZEN":
                return [
                    { name: "Dashboard", href: "/citizen/dashboard", icon: HomeIcon },
                    { name: "Grievances", href: "/citizen/grievances", icon: DocumentTextIcon },
                    { name: "Vehicles", href: "/citizen/vehicles", icon: MapIcon },
                    { name: "Profile", href: "/citizen/profile", icon: UserCircleIcon },
                ];
            case "OFFICER":
                return [
                    { name: "Dashboard", href: "/officer/dashboard", icon: HomeIcon },
                    { name: "Cases", href: "/officer/cases", icon: DocumentTextIcon },
                    { name: "Profile", href: "/officer/profile", icon: UserCircleIcon },
                ];
            case "DEPT_HEAD":
                return [
                    { name: "Dashboard", href: "/dept-head/dashboard", icon: HomeIcon },
                    { name: "Analytics", href: "/dept-head/analytics", icon: ChartBarIcon },
                    { name: "Team", href: "/dept-head/team", icon: UserCircleIcon },
                    { name: "Profile", href: "/dept-head/profile", icon: UserCircleIcon },
                ];
            case "ADMIN":
            case "SUPER_ADMIN":
                return [
                    { name: "Apps", href: "/admin/dashboard", icon: HomeIcon },
                    { name: "Reports", href: "/admin/grievances", icon: DocumentTextIcon },
                    { name: "Users", href: "/admin/users", icon: UserCircleIcon },
                    { name: "Docs", href: "/admin/departments", icon: BuildingOfficeIcon },
                    { name: "Fleet", href: "/admin/vehicles", icon: MapIcon },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems();
    const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

    return (
        <nav className="border-b border-slate-100 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg shadow-slate-200/50 transition-all group-hover:scale-105 p-2 relative ring-1 ring-slate-100">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                                alt="National Emblem of India"
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black tracking-tight text-slate-900 leading-none">SevaSetu</span>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Urban Governance</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex lg:items-center lg:gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-blue-600"
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        ))}

                        {isAdmin && (
                            <div className="relative ml-1" ref={systemMenuRef}>
                                <button
                                    onClick={() => setSystemMenuOpen(!systemMenuOpen)}
                                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${systemMenuOpen ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                                        }`}
                                >
                                    <Cog6ToothIcon className="h-4 w-4" />
                                    System
                                    <ChevronDownIcon className={`h-3 w-3 transition-transform ${systemMenuOpen ? "rotate-180" : ""}`} />
                                </button>

                                {systemMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
                                        <Link href="/admin/analytics" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600" onClick={() => setSystemMenuOpen(false)}>
                                            <ChartBarIcon className="h-4 w-4" />
                                            Analytics
                                        </Link>
                                        <Link href="/admin/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600" onClick={() => setSystemMenuOpen(false)}>
                                            <Cog6ToothIcon className="h-4 w-4" />
                                            Settings
                                        </Link>
                                        <Link href="/admin/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600" onClick={() => setSystemMenuOpen(false)}>
                                            <UserCircleIcon className="h-4 w-4" />
                                            My Profile
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* User Section */}
                    <div className="hidden md:flex md:items-center md:gap-4">
                        {/* Notifications */}
                        <div className="relative" ref={notificationsRef}>
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className={`relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-all hover:bg-slate-100 ${notificationsOpen ? "bg-slate-900 text-white" : ""}`}
                            >
                                <BellIcon className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {notificationsOpen && (
                                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between border-b border-slate-50 px-4 py-3">
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button onClick={() => markAsRead()} className="text-[10px] font-bold text-blue-600 hover:text-blue-700">Mark all read</button>
                                        )}
                                    </div>
                                    <div className="max-h-96 overflow-y-auto pt-2">
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-8 text-center text-xs text-slate-500 italic">No notifications yet</div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => {
                                                        if (!n.isRead) markAsRead(n.id);
                                                        if (n.grievanceId) router.push(`/${userRole.toLowerCase().replace("_", "-")}/grievances/${n.grievanceId}`);
                                                        setNotificationsOpen(false);
                                                    }}
                                                    className={`group relative flex cursor-pointer flex-col rounded-xl px-4 py-3 transition-colors hover:bg-slate-50 ${!n.isRead ? "bg-blue-50/30" : ""}`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`text-[10px] font-black uppercase tracking-wider ${n.type === "URGENT" ? "text-red-600" : "text-blue-600"}`}>
                                                            {n.type}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{n.title}</h4>
                                                    <p className="mt-0.5 text-[11px] text-slate-600 line-clamp-2">{n.message}</p>
                                                    {!n.isRead && (
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-blue-600 shadow-sm shadow-blue-500/50"></div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="hidden lg:block text-right">
                            <p className="text-xs font-extrabold text-slate-900 leading-none">{userName}</p>
                            <p className="mt-1 text-[10px] font-bold text-blue-600 uppercase tracking-wider">{userRole.replace("_", " ")}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="flex h-10 items-center justify-center rounded-xl bg-slate-50 px-4 text-xs font-bold text-slate-600 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                            {isLoggingOut ? "..." : <ArrowRightOnRectangleIcon className="h-5 w-5" />}
                        </button>
                    </div>

                    {/* Mobile toggle */}
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden rounded-xl bg-slate-50 p-2 text-slate-600">
                        {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <div className="border-t border-slate-100 bg-white lg:hidden animate-in fade-in slide-in-from-top-4">
                    <div className="space-y-1 p-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        ))}
                        {isAdmin && (
                            <div className="space-y-1 pt-2 border-t border-slate-50 mt-2">
                                <Link href="/admin/analytics" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                                    <ChartBarIcon className="h-5 w-5" />
                                    Analytics
                                </Link>
                                <Link href="/admin/settings" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                                    <Cog6ToothIcon className="h-5 w-5" />
                                    Settings
                                </Link>
                                <Link href="/admin/profile" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>
                                    <UserCircleIcon className="h-5 w-5" />
                                    Profile
                                </Link>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 mt-4"
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
