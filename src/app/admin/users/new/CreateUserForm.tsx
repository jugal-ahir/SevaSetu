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

interface CreateUserFormProps {
    departments: Department[];
    regions: Region[];
}

export default function CreateUserForm({ departments, regions }: CreateUserFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
            role: formData.get("role"),
            departmentId: formData.get("departmentId") || null,
            regionId: formData.get("regionId") || null,
            isVerified: formData.get("isVerified") === "on",
        };

        startTransition(async () => {
            try {
                const response = await fetch("/api/admin/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Failed to create user");
                }

                router.push("/admin/users");
                router.refresh();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again.";
                setError(errorMessage);
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
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="john@example.com"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        minLength={8}
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="••••••••"
                    />
                </div>

                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-slate-700">Role</label>
                    <select
                        id="role"
                        name="role"
                        required
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
                    className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-bold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                    {isPending ? "Creating..." : "Create User"}
                </button>
            </div>
        </form>
    );
}
