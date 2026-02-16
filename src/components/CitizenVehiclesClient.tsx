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
                    <div key={vehicle.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                                <TruckIcon className="h-6 w-6" />
                            </div>
                            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                Active
                            </span>
                        </div>

                        <h3 className="mt-4 text-lg font-bold text-slate-900">{vehicle.registrationNumber}</h3>
                        <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">{vehicle.type.replace("_", " ")}</p>

                        <div className="mt-6 space-y-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <MapIcon className="h-4 w-4" />
                                <span>{vehicle.lastKnownLat?.toFixed(4) || "23.03"}, {vehicle.lastKnownLng?.toFixed(4) || "72.55"}</span>
                            </div>
                            {vehicle.department && <p className="text-xs text-slate-400">Dept: {vehicle.department.name}</p>}
                            <button onClick={() => setTrackingVehicle(vehicle)} className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700">
                                <MapIcon className="h-4 w-4" />
                                Track Live
                            </button>
                        </div>
                    </div>
                ))
            )}

            {/* Tracking Modal */}
            {trackingVehicle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-3xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Live Surveillance</h2>
                                <p className="text-sm font-medium text-slate-500">{trackingVehicle.registrationNumber}</p>
                            </div>
                            <button onClick={() => setTrackingVehicle(null)} className="rounded-xl bg-red-50 p-2 text-red-600 transition-colors">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="h-[450px] w-full p-4">
                            <LiveVehicleMap vehicleName={trackingVehicle.registrationNumber} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
