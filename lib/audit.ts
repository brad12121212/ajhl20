import { prisma } from "@/lib/db";

export type AuditAction =
  | "event.create"
  | "event.update"
  | "event.cancel"
  | "event.reschedule"
  | "registration.approve"
  | "registration.remove"
  | "registration.bulk_approve"
  | "registration.bulk_waitlist_to_going"
  | "registration.update_line_position"
  | "user.update_admin"
  | "user.reset_password"
  | "user.update_profile";

export async function logAudit(params: {
  userId: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? undefined,
      details: params.details ?? undefined,
    },
  });
}
