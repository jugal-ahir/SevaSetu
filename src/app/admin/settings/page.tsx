import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import SlaRuleForm from "@/components/SlaRuleForm";
import SettingsToggle from "@/components/SettingsToggle";
import {
    Cog6ToothIcon,
    ShieldCheckIcon,
    ScaleIcon
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
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole={user.role} userName={user.name} />

            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
                    <p className="mt-2 text-slate-600">Configure global application parameters and rules</p>
                </div>

                <div className="space-y-6">
                    {/* General Settings */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-2">
                            <Cog6ToothIcon className="h-5 w-5 text-slate-500" />
                            <h2 className="font-bold text-slate-900">General Configuration</h2>
                        </div>
                        <form action={updateSettings} className="p-6 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Application Name</label>
                                    <input type="text" defaultValue="SevaSetu" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Admin Email</label>
                                    <input type="email" defaultValue="admin@sevasetu.gov" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-blue-500" />
                                </div>
                            </div>
                            <div className="flex items-center justify-end pt-4">
                                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* SLA Rules */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ScaleIcon className="h-5 w-5 text-slate-500" />
                                <h2 className="font-bold text-slate-900">SLA Rules</h2>
                            </div>
                            <SlaRuleForm departments={departments} createSlaRuleAction={createSlaRule} />
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Escalation</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dept</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {slaRules.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500 italic">No SLA rules defined</td></tr>
                                    ) : (
                                        slaRules.map(rule => (
                                            <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{rule.category}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${rule.priority === "URGENT" ? "bg-red-100 text-red-700" :
                                                        rule.priority === "HIGH" ? "bg-orange-100 text-orange-700" :
                                                            "bg-blue-100 text-blue-700"
                                                        }`}>
                                                        {rule.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 font-medium">{formatDuration(rule.durationSeconds)}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 font-bold">{rule.escalationRole.replace("_", " ")}</td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{rule.department?.name || "Global"}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8 transition-all hover:shadow-md">
                        <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-4">
                            <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                            <h2 className="text-lg font-bold text-slate-900">Security & Authentication</h2>
                        </div>
                        <div className="space-y-8">
                            <SettingsToggle
                                settingKey="FORCE_VERIFICATION"
                                initialValue={forceVerification}
                                title="Force Identity Verification"
                                description="Require citizens to verify their Aadhaar/National ID before submitting or tracking grievances."
                                toggleAction={toggleSetting}
                            />

                            <SettingsToggle
                                settingKey="MAINTENANCE_MODE"
                                initialValue={maintenanceMode}
                                title="System Maintenance Mode"
                                description="Gracefully disable public access and grievance submissions. Only administrators will have access."
                                toggleAction={toggleSetting}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
