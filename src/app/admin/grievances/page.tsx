import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default async function AdminGrievancesList() {
    const user = await getCurrentUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        redirect("/login");
    }

    const grievances = await prisma.grievance.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            citizen: { select: { name: true } },
            department: { select: { name: true } },
            region: { select: { name: true } },
        }
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar userRole={user.role} userName={user.name} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">All System Grievances</h1>
                    <p className="mt-2 text-slate-600">Master view of all issues reported across all departments</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Citizen</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {grievances.map(g => (
                                <tr key={g.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-900 line-clamp-1">{g.title}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${g.status === "RESOLVED" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                            }`}>
                                            {g.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{g.department?.name || "Unassigned"}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{g.citizen.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(g.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <Link href={`/admin/grievances/${g.id}`} className="text-blue-600 hover:text-blue-900 font-bold">
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
