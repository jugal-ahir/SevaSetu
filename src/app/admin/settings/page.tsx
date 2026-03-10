import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import SlaRuleForm from "@/components/SlaRuleForm";
import SettingsToggle from "@/components/SettingsToggle";
import {
    Cog6ToothIcon,
    ShieldCheckIcon,
    ScaleIcon,
    InformationCircleIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";

export default async function AdminSettings() {
    const user = await getCurrentUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    const [slaRules, departments, systemSettings] = await Promise.all([
        prisma.slaRule.findMany({
            include: { department: { select: { name: true } } },
            orderBy: { createdAt: "desc" }
        }),
        prisma.department.findMany({ select: { id: true, name: true } }),
        prisma.systemSetting.findMany()
    ]);

    const settingsMap = systemSettings.reduce((acc, s) => {
        acc[s.key] = s.value === "true";
        return acc;
    }, {} as Record<string, boolean>);

    // Default values if not in DB
    const forceVerification = settingsMap["FORCE_VERIFICATION"] ?? true;
    const maintenanceMode = settingsMap["MAINTENANCE_MODE"] ?? false;

    async function updateSettings(formData: FormData) {
        "use server";
        // Mock setting update logic
        console.log("Settings updated:", Object.fromEntries(formData));
        redirect("/admin/settings");
    }

    async function createSlaRule(formData: FormData) {
        "use server";
        const category = formData.get("category") as string;
        const priority = formData.get("priority") as string;
        const durationSeconds = parseInt(formData.get("durationSeconds") as string);
        const escalationRole = formData.get("escalationRole") as any;
        const departmentId = formData.get("departmentId") as string;

        await prisma.slaRule.create({
            data: {
                category,
                priority,
                durationSeconds,
                escalationRole,
                departmentId: departmentId || null,
            }
        });

        redirect("/admin/settings");
    }

    function formatDuration(seconds: number) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        const parts = [];
        if (h > 0) parts.push(`${h}h`);
        if (m > 0) parts.push(`${m}m`);
        if (s > 0) parts.push(`${s}s`);
        if (parts.length === 0) return "0s";
        return parts.join(" ");
    }

    async function toggleSetting(key: string, value: boolean) {
        "use server";
        await prisma.systemSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value), type: "BOOLEAN" }
        });
        redirect("/admin/settings");
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500/30">
            {/* Subtle background decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[0%] left-[-10%] w-[60%] h-[60%] rounded-full bg-slate-200/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[100px]" />
            </div>

            <Navbar userRole={user.role} userName={user.name} />

            <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900 mb-2">
                        System Configuration
                    </h1>
                    <p className="text-lg text-slate-500 font-medium">
                        Manage global platform settings, service level agreements, and security parameters
                    </p>
                </div>

                <div className="space-y-8">
                    {/* General Settings */}
                    <div className="rounded-3xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5 sm:px-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                                    <Cog6ToothIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-heading font-bold text-slate-900">General Properties</h2>
                                    <p className="text-sm font-medium text-slate-500">Core application identity</p>
                                </div>
                            </div>
                        </div>
                        <form action={updateSettings} className="p-6 sm:p-8">
                            <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Application Name</label>
                                    <input
                                        type="text"
                                        defaultValue="SevaSetu"
                                        className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
                                    />
                                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
                                        <InformationCircleIcon className="h-4 w-4" /> This name appears in emails and headers.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Administrator Email</label>
                                    <input
                                        type="email"
                                        defaultValue="admin@sevasetu.gov"
                                        className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
                                    />
                                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
                                        <InformationCircleIcon className="h-4 w-4" /> Primary technical contact address.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-end pt-8 mt-4 border-t border-slate-100">
                                <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-[0_8px_16px_-6px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_20px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5">
                                    <CheckCircleIcon className="h-5 w-5" />
                                    Save Properties
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* SLA Rules */}
                    <div className="rounded-3xl border border-slate-200/60 bg-white shadow-sm overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"></div>

                        <div className="relative z-10 border-b border-slate-100 bg-slate-50/50 px-6 py-5 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
                                    <ScaleIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-heading font-bold text-slate-900">Service Level Agreements (SLA)</h2>
                                    <p className="text-sm font-medium text-slate-500">Define resolution timelines and escalation paths</p>
                                </div>
                            </div>
                            <div className="shrink-0 w-full sm:w-auto">
                                <SlaRuleForm departments={departments} createSlaRuleAction={createSlaRule} />
                            </div>
                        </div>

                        <div className="relative z-10 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 sm:px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Category</th>
                                        <th className="px-6 sm:px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Priority Target</th>
                                        <th className="px-6 sm:px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Max Duration</th>
                                        <th className="px-6 sm:px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Escalation Recipient</th>
                                        <th className="px-6 sm:px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Department Scope</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {slaRules.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 sm:px-8 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <ScaleIcon className="h-10 w-10 text-slate-300 mb-2" />
                                                    <p className="text-sm font-bold text-slate-500">No SLA rules defined yet.</p>
                                                    <p className="text-xs text-slate-400 mt-1 max-w-sm">Create rules to automatically escalate grievances that exceed acceptable resolution times.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        slaRules.map(rule => (
                                            <tr key={rule.id} className="hover:bg-indigo-50/30 transition-colors">
                                                <td className="px-6 sm:px-8 py-5">
                                                    <span className="font-bold text-slate-900 capitalize">{rule.category.toLowerCase()}</span>
                                                </td>
                                                <td className="px-6 sm:px-8 py-5">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${rule.priority === "URGENT" ? "bg-red-50 text-red-700 border-red-200" :
                                                            rule.priority === "HIGH" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                                                "bg-blue-50 text-blue-700 border-blue-200"
                                                        }`}>
                                                        {rule.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 sm:px-8 py-5">
                                                    <span className="text-sm font-bold text-slate-700 font-mono bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                                                        {formatDuration(rule.durationSeconds)}
                                                    </span>
                                                </td>
                                                <td className="px-6 sm:px-8 py-5">
                                                    <span className="text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                                                        {rule.escalationRole.replace("_", " ")}
                                                    </span>
                                                </td>
                                                <td className="px-6 sm:px-8 py-5 text-sm font-medium text-slate-500">
                                                    {rule.department ? (
                                                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>{rule.department.name}</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Global Defaults</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Security Features */}
                    <div className="rounded-3xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5 sm:px-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                                    <ShieldCheckIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-heading font-bold text-slate-900">Security & Authentication</h2>
                                    <p className="text-sm font-medium text-slate-500">Critical platform protection mechanisms</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 sm:p-8 space-y-8">
                            <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-colors">
                                <SettingsToggle
                                    settingKey="FORCE_VERIFICATION"
                                    initialValue={forceVerification}
                                    title="Force Identity Verification"
                                    description="Require citizens to verify their Aadhaar/National ID before submitting or tracking grievances. Highly recommended to prevent spam."
                                    toggleAction={toggleSetting}
                                />
                            </div>

                            <div className="p-6 rounded-2xl border border-red-100 bg-red-50/30 hover:bg-red-50/50 hover:border-red-200 transition-colors">
                                <SettingsToggle
                                    settingKey="MAINTENANCE_MODE"
                                    initialValue={maintenanceMode}
                                    title="System Maintenance Mode"
                                    description="Gracefully disable public access and grievance submissions. Only administrators will have access. Use during major upgrades."
                                    toggleAction={toggleSetting}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
