"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
} from "recharts";

interface AnalyticsChartsProps {
    trendData: { date: string; count: number }[];
    statusData: { name: string; value: number; color: string }[];
    categoryData: { name: string; value: number }[];
}

export default function AnalyticsCharts({ trendData, statusData, categoryData }: AnalyticsChartsProps) {
    return (
        <div className="grid gap-8 lg:grid-cols-2 mb-8">
            {/* Trend Chart */}
            <div className="rounded-3xl border border-slate-200/60 bg-white p-6 sm:p-8 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-xl font-heading font-black text-slate-900">Grievance Trends</h3>
                    <p className="text-sm font-medium text-slate-500">Volume over the last 30 days</p>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                                    borderRadius: '16px', 
                                    border: '1px solid #e2e8f0', 
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    backdropFilter: 'blur(8px)'
                                }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#3b82f6" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorCount)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Distribution */}
            <div className="rounded-3xl border border-slate-200/60 bg-white p-6 sm:p-8 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-xl font-heading font-black text-slate-900">Category Distribution</h3>
                    <p className="text-sm font-medium text-slate-500">Grievances by department category</p>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }}
                                width={100}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                                    borderRadius: '16px', 
                                    border: '1px solid #e2e8f0',
                                    backdropFilter: 'blur(8px)'
                                }}
                            />
                            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#6366f1" : "#818cf8"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Status Breakdown (Donut Chart) */}
            <div className="rounded-3xl border border-slate-200/60 bg-white p-6 sm:p-8 shadow-sm lg:col-span-2">
                <div className="mb-6">
                    <h3 className="text-xl font-heading font-black text-slate-900">Status Snapshot</h3>
                    <p className="text-sm font-medium text-slate-500">Current state of all department grievances</p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="h-[250px] w-full md:w-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                                        borderRadius: '16px', 
                                        border: '1px solid #e2e8f0'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
                        {statusData.map((status) => (
                            <div key={status.name} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: status.color }}></span>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{status.name}</p>
                                    <p className="text-lg font-bold text-slate-900">{status.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
