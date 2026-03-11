"use client";

import { 
    CheckCircleIcon, 
    ClockIcon, 
    ArrowTrendingUpIcon, 
    ExclamationCircleIcon 
} from "@heroicons/react/24/outline";

interface KPIStatsProps {
    total: number;
    resolved: number;
    avgResolutionTime: number; // in hours
    escalated: number;
}

export default function KPIStats({ total, resolved, avgResolutionTime, escalated }: KPIStatsProps) {
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <KPICard 
                title="Resolution Rate" 
                value={`${resolutionRate}%`}
                subtitle="Overall performance"
                icon={<ArrowTrendingUpIcon className="h-6 w-6 text-emerald-600" />}
                color="emerald"
            />
            <KPICard 
                title="Avg. Resolution" 
                value={avgResolutionTime > 0 ? `${avgResolutionTime.toFixed(1)}h` : "N/A"}
                subtitle="Time to resolve"
                icon={<ClockIcon className="h-6 w-6 text-blue-600" />}
                color="blue"
            />
            <KPICard 
                title="Resolved" 
                value={resolved.toString()}
                subtitle="Total success cases"
                icon={<CheckCircleIcon className="h-6 w-6 text-indigo-600" />}
                color="indigo"
            />
            <KPICard 
                title="Escalated" 
                value={escalated.toString()}
                subtitle="Requiring attention"
                icon={<ExclamationCircleIcon className="h-6 w-6 text-red-600" />}
                color="red"
            />
        </div>
    );
}

function KPICard({ title, value, subtitle, icon, color }: { title: string; value: string; subtitle: string; icon: React.ReactNode; color: string }) {
    const colorClasses = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        red: "bg-red-50 text-red-600 border-red-100",
    }[color] || "bg-slate-50 text-slate-600 border-slate-100";

    return (
        <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl border ${colorClasses} shadow-inner group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
                    <h3 className="text-2xl font-heading font-black text-slate-900">{value}</h3>
                </div>
            </div>
            <p className="text-xs font-medium text-slate-500">{subtitle}</p>
        </div>
    );
}
