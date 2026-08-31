import { db } from "@/lib/db";
export async function audit(input: { actorId?: string; action: string; entityType: string; entityId?: string; ip?: string | null; userAgent?: string | null; metadata?: object }) {
  await db.auditEvent.create({ data: { ...input, ip: input.ip ?? undefined, userAgent: input.userAgent ?? undefined } });
}
