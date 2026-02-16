"use client";

import { useTransition } from "react";

interface SettingsToggleProps {
    settingKey: string;
    initialValue: boolean;
    title: string;
    description: string;
    toggleAction: (key: string, value: boolean) => Promise<void>;
}

export default function SettingsToggle({
    settingKey,
    initialValue,
    title,
    description,
    toggleAction
}: SettingsToggleProps) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            await toggleAction(settingKey, !initialValue);
        });
    };

    return (
        <div className="flex items-center justify-between py-2 group">
            <div className="pr-6">
                <p className="text-[13px] font-black text-slate-800 tracking-tight leading-none mb-1 group-hover:text-blue-600 transition-colors uppercase italic">{title}</p>
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed max-w-[280px]">{description}</p>
            </div>

            <div className="flex items-center">
                <button
                    onClick={handleToggle}
                    disabled={isPending}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${initialValue ? "bg-blue-600 shadow-lg shadow-blue-500/30" : "bg-slate-200"
                        } ${isPending ? "opacity-40 cursor-wait" : "hover:scale-105 active:scale-95"}`}
                >
                    <span className="sr-only">Toggle setting</span>
                    <span
                        className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow-xl ring-0 transition-all duration-300 ease-in-out ${initialValue ? "translate-x-5 shadow-blue-900/20" : "translate-x-0"
                            } flex items-center justify-center`}
                    >
                        {/* Subtle micro-indicator inside the knob */}
                        <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${initialValue ? "bg-blue-600 scale-100" : "bg-slate-300 scale-50 opacity-0"
                            }`} />
                    </span>
                </button>
            </div>
        </div>
    );
}
