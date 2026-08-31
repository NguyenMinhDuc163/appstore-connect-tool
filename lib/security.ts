import { NextRequest } from "next/server";

export function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) throw new Error("Invalid request origin");
}

export function assertCron(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected || request.headers.get("authorization") !== `Bearer ${expected}`) throw new Error("Unauthorized");
}
