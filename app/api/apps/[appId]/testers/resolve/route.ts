import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { resolveTesterState } from "@/lib/services/tester-resolution";

const query = z.object({ email: z.string().email().max(254) });

export async function GET(request: NextRequest, { params }: { params: Promise<{ appId: string }> }) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { appId } = await params;
    if (!await db.app.findUnique({ where: { id: appId }, select: { id: true } })) return NextResponse.json({ error: "App not found" }, { status: 404 });
    const { email } = query.parse({ email: request.nextUrl.searchParams.get("email") });
    const result = await resolveTesterState(email);
    return NextResponse.json({ kind: result.kind, needsNames: result.needsNames, firstName: result.firstName, lastName: result.lastName });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not resolve tester" }, { status: 400 });
  }
}
