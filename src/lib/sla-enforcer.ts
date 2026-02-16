import { prisma } from "./prisma";

/**
 * Globally checks for overdue grievances and escalates them.
 * This should be called on frequently accessed endpoints (like notifications)
 * to simulate automated background processing in a serverless environment.
 */
export async function enforceSla() {
    try {
        const now = new Date();

        // Find ALL overdue grievances across the system that aren't yet handled
        const overdueGrievances = await prisma.grievance.findMany({
            where: {
                slaDueAt: { lt: now },
                status: { notIn: ["ESCALATED", "RESOLVED", "CLOSED"] },
                // We also check for priority to avoid re-processing if priority is already URGENT but status isn't ESCALATED yet
                OR: [
                    { priority: { not: "URGENT" } },
                    { status: { not: "ESCALATED" } }
                ]
            },
            select: {
                id: true,
                departmentId: true,
                title: true,
                status: true,
                priority: true
            }
        });

        if (overdueGrievances.length === 0) return;

        for (const g of overdueGrievances) {
            // Update the grievance status and priority
            await prisma.grievance.update({
                where: { id: g.id },
                data: {
                    status: "ESCALATED",
                    priority: "URGENT"
                }
            });

            // Create status history entry
            await prisma.grievanceStatusHistory.create({
                data: {
                    grievanceId: g.id,
                    fromStatus: g.status,
                    toStatus: "ESCALATED",
                    changedById: null,
                    note: "Automatically escalated due to SLA breach."
                }
            });

            // Notify Department Head
            if (g.departmentId) {
                const dept = await prisma.department.findUnique({
                    where: { id: g.departmentId },
                    select: { headId: true }
                });

                if (dept?.headId) {
                    await prisma.notification.create({
                        data: {
                            userId: dept.headId,
                            title: "SLA BREACH ALERT!",
                            message: `Grievance "${g.title}" has breached its SLA and is now ESCALATED.`,
                            type: "URGENT",
                            grievanceId: g.id
                        }
                    });
                }
            }

            // Log the system action
            await prisma.auditLog.create({
                data: {
                    action: "UPDATE_GRIEVANCE_STATUS",
                    grievanceId: g.id,
                    entity: "Grievance",
                    entityId: g.id,
                    metadata: JSON.stringify({ reason: "SLA_BREACH", oldStatus: g.status, newStatus: "ESCALATED" }),
                    actorId: null
                }
            });
        }
    } catch (error) {
        console.error("SLA Enforcement Error:", error);
    }
}
