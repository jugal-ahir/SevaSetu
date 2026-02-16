"use client";

import { useState, useTransition } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Department {
    id: string;
    name: string;
}

interface SlaRuleFormProps {
    departments: Department[];
    createSlaRuleAction: (formData: FormData) => Promise<void>;
}

export default function SlaRuleForm({ departments, createSlaRuleAction }: SlaRuleFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(formData: FormData) {
        const value = parseInt(formData.get("durationValue") as string);
        const unit = formData.get("durationUnit") as string;

        let seconds = value;
        if (unit === "MINUTES") seconds = value * 60;
        else if (unit === "HOURS") seconds = value * 3600;

        formData.set("durationSeconds", seconds.toString());

        startTransition(async () => {
            await createSlaRuleAction(formData);
            setIsOpen(false);
        });
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
                <PlusIcon className="h-4 w-4" />
                New Rule
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
                            <h2 className="text-xl font-bold text-slate-900">Define SLA Rule</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form action={handleSubmit} className="p-8 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Category / Topic</label>
                                <input
                                    name="category"
                                    type="text"
                                    required
                                    placeholder="e.g. Potholes, Water Leakage"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Priority</label>
                                    <select
                                        name="priority"
                                        required
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="NORMAL">Normal</option>
                                        <option value="HIGH">High</option>
                                        <option value="URGENT">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Duration</label>
                                    <div className="flex gap-2">
                                        <input
                                            name="durationValue"
                                            type="number"
                                            required
                                            min="1"
                                            className="w-2/3 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                            placeholder="24"
                                        />
                                        <select
                                            name="durationUnit"
                                            required
                                            defaultValue="HOURS"
                                            className="w-1/3 rounded-xl border border-slate-300 px-2 py-3 text-xs font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                        >
                                            <option value="SECONDS">Sec</option>
                                            <option value="MINUTES">Min</option>
                                            <option value="HOURS">Hrs</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Escalation Role</label>
                                <select
                                    name="escalationRole"
                                    required
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                >
                                    <option value="OFFICER">Officer</option>
                                    <option value="DEPT_HEAD">Dept Head</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Department</label>
                                <select
                                    name="departmentId"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                >
                                    <option value="">Global (All Departments)</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                            >
                                {isPending ? "Configuring..." : "Add SLA Rule"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
