import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });
  const [apps, testers, builds, operations] = await Promise.all([
    db.app.findMany({ where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { bundleId: { contains: q, mode: "insensitive" } }] }, take: 5, orderBy: { name: "asc" } }),
    db.tester.findMany({ where: { email: { contains: q, mode: "insensitive" } }, take: 5, include: { apps: { take: 1 } } }),
    db.build.findMany({ where: { version: { contains: q, mode: "insensitive" } }, take: 5, include: { app: true }, orderBy: { uploadedAt: "desc" } }),
    db.operation.findMany({ where: { OR: [{ id: { contains: q, mode: "insensitive" } }, { kind: { equals: q.toUpperCase().replaceAll(" ", "_") as never } }] }, take: 5, include: { app: true }, orderBy: { createdAt: "desc" } }),
  ]);
  return NextResponse.json({ results: [
    ...apps.map(item => ({ id: `app:${item.id}`, type: "App", title: item.name, subtitle: item.bundleId, href: `/apps/${item.id}` })),
    ...testers.map(item => ({ id: `tester:${item.id}`, type: "Tester", title: item.email ?? "Anonymous tester", subtitle: item.state ?? "Tester", href: item.apps[0] ? `/apps/${item.apps[0].appId}/testers?q=${encodeURIComponent(item.email ?? "")}` : `/testflight/testers?q=${encodeURIComponent(item.email ?? "")}` })),
    ...builds.map(item => ({ id: `build:${item.id}`, type: "Build", title: `${item.app.name} · ${item.version}`, subtitle: item.processingState ?? "Build", href: `/testflight/builds?q=${encodeURIComponent(item.version)}` })),
    ...operations.map(item => ({ id: `operation:${item.id}`, type: "Operation", title: item.kind.replaceAll("_", " "), subtitle: `${item.status}${item.app ? ` · ${item.app.name}` : ""}`, href: `/operations/${item.id}` })),
  ] });
}
