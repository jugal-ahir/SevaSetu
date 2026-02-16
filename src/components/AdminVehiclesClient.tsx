"use client";

import { useState } from "react";
import { TruckIcon, PlusIcon, TrashIcon, MapIcon, XMarkIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";

const LiveVehicleMap = dynamic(() => import("@/components/LiveVehicleMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-slate-100 rounded-3xl" />
});

interface Vehicle {
    id: string;
    registrationNumber: string;
    type: string;
    isActive: boolean;
    department?: { name: string } | null;
}

interface AdminVehiclesClientProps {
    initialVehicles: Vehicle[];
    departments: { id: string, name: string }[];
    createVehicleAction: (formData: FormData) => Promise<void>;
    deleteVehicleAction: (formData: FormData) => Promise<void>;
}

export default function AdminVehiclesClient({
    initialVehicles,
    departments,
    createVehicleAction,
    deleteVehicleAction
}: AdminVehiclesClientProps) {
    const [trackingVehicle, setTrackingVehicle] = useState<Vehicle | null>(null);

    return (
        <div className="grid gap-8 lg:grid-cols-3">
            {/* Add Vehicle Form */}
            <div className="lg:col-span-1">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Add New Vehicle</h2>
                    <form action={createVehicleAction} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Registration Number *</label>
                            <input name="registrationNumber" required className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="MH-12-AB-1234" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Vehicle Type *</label>
                            <select name="type" required className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                                <option value="">Select Type</option>
                                <option value="GARBAGE_TRUCK">Garbage Truck</option>
                                <option value="WATER_TANKER">Water Tanker</option>
                                <option value="AMBULANCE">Ambulance</option>
                                <option value="PATROL_CAR">Patrol Car</option>
                                <option value="MAINTENANCE_VAN">Maintenance Van</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Department</label>
                            <select name="departmentId" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700">
                            <PlusIcon className="h-5 w-5" />
                            Add Vehicle
                        </button>
                    </form>
                </div>
            </div>

            {/* Vehicles List */}
            <div className="lg:col-span-2">
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vehicle Info</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="relative px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {initialVehicles.map((vehicle) => (
                                <tr key={vehicle.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                <TruckIcon className="h-5 w-5" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-slate-900">{vehicle.registrationNumber}</div>
                                                <div className="text-sm text-slate-500">{vehicle.type.replace("_", " ")}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-900">{vehicle.department?.name || "Unassigned"}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${vehicle.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                            {vehicle.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-4">
                                            <button onClick={() => setTrackingVehicle(vehicle)} className="text-blue-600 hover:text-blue-900 font-bold flex items-center gap-1">
                                                <MapIcon className="h-4 w-4" />
                                                Track
                                            </button>
                                            <form action={deleteVehicleAction}>
                                                <input type="hidden" name="vehicleId" value={vehicle.id} />
                                                <button type="submit" className="text-red-500 hover:text-red-700">
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tracking Modal */}
            {trackingVehicle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-4xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Fleet Surveillance</h2>
                                <p className="text-sm font-medium text-slate-500">{trackingVehicle.registrationNumber}</p>
                            </div>
                            <button onClick={() => setTrackingVehicle(null)} className="rounded-xl bg-red-50 p-2 text-red-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="h-[500px] w-full p-4">
                            <LiveVehicleMap vehicleName={trackingVehicle.registrationNumber} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
