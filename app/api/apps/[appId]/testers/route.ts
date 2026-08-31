import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security";
import { audit } from "@/lib/services/audit";
import { enqueueAddTester, runAddTester } from "@/lib/services/operations";
import { suggestReplacement } from "@/lib/services/replacement";
import { resolveTesterState } from "@/lib/services/tester-resolution";

const schema = z.object({ email: z.string().email().max(254), firstName: z.string().trim().min(1).max(100).optional(), lastName: z.string().trim().min(1).max(100).optional(), role: z.enum(["DEVELOPER", "APP_MANAGER", "MARKETING"]).optional(), groupId: z.string().optional(), autoAssignBuild: z.boolean().optional() });

export async function POST(request: NextRequest, { params }: { params: Promise<{ appId: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role === "VIEWER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { appId } = await params;
    const value = schema.parse(await request.json());
    const resolution = await resolveTesterState(value.email);
    if (resolution.needsNames && (!value.firstName || !value.lastName)) return NextResponse.json({ error: "Apple requires a first and last name to invite this new team member.", needsNames: true }, { status: 422 });
    const [existing, members] = await Promise.all([
      db.testerApp.findFirst({ where: { appId, tester: { email: { equals: value.email, mode: "insensitive" } } } }),
      db.testerGroup.findMany({ where: { group: { appId, isInternal: true } }, select: { testerId: true }, distinct: ["testerId"] }),
    ]);
    if (!existing && members.length >= 100) {
      const candidate = await suggestReplacement(appId);
      return NextResponse.json({ error: candidate ? "Internal tester capacity is full. Apple Ops found a safe replacement candidate." : "Internal tester capacity is full, but no candidate is safe to replace.", capacityFull: true, candidate }, { status: 409 });
    }
    const op = await enqueueAddTester({ appId, actorId: user.id, ...value });
    await audit({ actorId: user.id, action: "tester.add.schedule", entityType: "Operation", entityId: op.id, metadata: { appId, email: value.email, resolution: resolution.kind } });
    after(() => runAddTester(op.id).catch(() => undefined));
    return NextResponse.json({ operationId: op.id, status: op.status }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
}
