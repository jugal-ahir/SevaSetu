"use client";

import { useState } from "react";
import { TruckIcon, MapIcon, ClockIcon, XMarkIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";

const LiveVehicleMap = dynamic(() => import("@/components/LiveVehicleMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-slate-100 rounded-3xl" />
});

interface Vehicle {
    id: string;
    registrationNumber: string;
    type: string;
    lastKnownLat: number | null;
    lastKnownLng: number | null;
    lastUpdatedAt: Date | null;
    department?: { name: string } | null;
}

export default function CitizenVehiclesClient({ vehicles }: { vehicles: Vehicle[] }) {
    const [trackingVehicle, setTrackingVehicle] = useState<Vehicle | null>(null);

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                    <TruckIcon className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-4 text-lg font-medium text-slate-900">No Active Vehicles</h3>
                    <p className="mt-2 text-slate-600">There are currently no vehicles being tracked in your area.</p>
                </div>
            ) : (
                vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="rounded-3xl border border-blue-100 bg-blue-50/50 p-8 shadow-sm transition-all hover:bg-blue-50 hover:shadow-xl hover:shadow-blue-500/10 group">
                        <div className="flex items-start justify-between">
                            <div className="rounded-2xl bg-blue-600 p-4 text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                <TruckIcon className="h-6 w-6" />
                            </div>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-800 border border-emerald-200">
                                Live Now
                            </span>
                        </div>

                        <h3 className="mt-6 text-xl font-heading font-black text-slate-900 tracking-tight">{vehicle.registrationNumber}</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">{vehicle.type.replace("_", " ")}</p>

                        <div className="mt-8 space-y-4 border-t border-blue-200/50 pt-6">
                            <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center border border-blue-100 shadow-sm">
                                    <MapIcon className="h-4 w-4 text-blue-600" />
                                </div>
                                <span>{vehicle.lastKnownLat?.toFixed(4) || "23.04"}, {vehicle.lastKnownLng?.toFixed(4) || "72.55"}</span>
                            </div>
                            {vehicle.department && (
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-white border border-blue-100 px-3 py-1.5 rounded-lg w-max shadow-sm">
                                    Depart: {vehicle.department.name}
                                </p>
                            )}
                            <button
                                onClick={() => setTrackingVehicle(vehicle)}
                                className="mt-4 w-full h-14 flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-6 font-black text-white shadow-xl hover:bg-blue-600 transition-all hover:-translate-y-1 active:scale-95"
                            >
                                <MapIcon className="h-5 w-5" />
                                Launch Tracker
                            </button>
                        </div>
                    </div>
                ))
            )}

            {/* Tracking Modal */}
            {trackingVehicle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 sm:p-8 animate-fade-in">
                    <div className="relative w-full h-full max-w-7xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl flex flex-col">
                        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 sm:px-8 sm:py-6 bg-slate-50/80 backdrop-blur-md z-10 relative">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-blue-100 text-blue-600 shadow-inner">
                                    <MapIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-900">Live Surveillance</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{trackingVehicle.registrationNumber}</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setTrackingVehicle(null)}
                                className="group flex items-center justify-center p-3 rounded-2xl bg-slate-100 hover:bg-red-500 text-slate-500 hover:text-white transition-all shadow-sm ring-2 ring-transparent hover:ring-red-200"
                            >
                                <XMarkIcon className="h-6 w-6 group-hover:scale-110 group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>
                        <div className="flex-1 w-full relative bg-slate-100">
                            <LiveVehicleMap vehicleName={trackingVehicle.registrationNumber} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
