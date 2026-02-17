"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Department {
    id: string;
    name: string;
}

interface Region {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    departmentId: string | null;
    regionId: string | null;
}

interface EditUserFormProps {
    user: User;
    departments: Department[];
    regions: Region[];
}

export default function EditUserForm({ user, departments, regions }: EditUserFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            role: formData.get("role"),
            departmentId: formData.get("departmentId") || null,
            regionId: formData.get("regionId") || null,
            isVerified: formData.get("isVerified") === "on",
        };

        startTransition(async () => {
            try {
                const response = await fetch(`/api/admin/users/${user.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    throw new Error("Failed to update user");
                }

                router.push("/admin/users");
                router.refresh();
            } catch (err) {
                setError("Something went wrong. Please try again.");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Name</label>
                    <input
                        type="text"
                        value={user.name}
                        disabled
                        className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-500 shadow-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Email</label>
                    <input
                        type="text"
                        value={user.email}
                        disabled
                        className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-500 shadow-sm"
                    />
                </div>

                <div className="col-span-full">
                    <label htmlFor="role" className="block text-sm font-medium text-slate-700">Role</label>
                    <select
                        id="role"
                        name="role"
                        defaultValue={user.role}
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="CITIZEN">Citizen</option>
                        <option value="OFFICER">Officer</option>
                        <option value="DEPT_HEAD">Department Head</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="departmentId" className="block text-sm font-medium text-slate-700">Department</label>
                    <select
                        id="departmentId"
                        name="departmentId"
                        defaultValue={user.departmentId || ""}
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">No Department</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="regionId" className="block text-sm font-medium text-slate-700">Region</label>
                    <select
                        id="regionId"
                        name="regionId"
                        defaultValue={user.regionId || ""}
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">No Region</option>
                        {regions.map((region) => (
                            <option key={region.id} value={region.id}>
                                {region.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-span-full">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isVerified"
                            name="isVerified"
                            defaultChecked={user.isVerified}
                            className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="isVerified" className="text-sm font-medium text-slate-700">
                            Verified User (Identity Verified)
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {isPending ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
