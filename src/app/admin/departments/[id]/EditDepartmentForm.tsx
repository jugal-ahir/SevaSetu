"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Department {
    id: string;
    name: string;
    description: string | null;
    headId: string | null;
}

interface User {
    id: string;
    name: string;
    email: string;
}

interface EditDepartmentFormProps {
    department: Department;
    potentitialHeads: User[];
}

export default function EditDepartmentForm({ department, potentitialHeads }: EditDepartmentFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            description: formData.get("description"),
            headId: formData.get("headId") || null,
        };

        startTransition(async () => {
            try {
                const response = await fetch(`/api/admin/departments/${department.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    throw new Error("Failed to update department");
                }

                router.refresh();
                alert("Department updated successfully!");
            } catch (err) {
                setError("Something went wrong. Please try again.");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">Department Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    defaultValue={department.name}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    defaultValue={department.description || ""}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div>
                <label htmlFor="headId" className="block text-sm font-medium text-slate-700">Department Head</label>
                <select
                    id="headId"
                    name="headId"
                    defaultValue={department.headId || ""}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="">No Head Assigned</option>
                    {potentitialHeads.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                        </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">Only showing Officers and existing Heads.</p>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-lg bg-blue-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {isPending ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
