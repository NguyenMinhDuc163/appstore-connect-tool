import "server-only";
import { importPKCS8, SignJWT } from "jose";
import type { AppleList, AppleOne, AppleResource } from "./types";

const BASE_URL = "https://api.appstoreconnect.apple.com";
let cached: { token: string; expiresAt: number } | undefined;

function credentials() {
  const issuerId = process.env.APPLE_ISSUER_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!issuerId || !keyId || !privateKey) throw new Error("Apple API credentials are not configured");
  return { issuerId, keyId, privateKey };
}

async function token() {
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached.token;
  const { issuerId, keyId, privateKey } = credentials();
  const now = Math.floor(Date.now() / 1000);
  const key = await importPKCS8(privateKey, "ES256");
  const value = await new SignJWT({ iss: issuerId, aud: "appstoreconnect-v1" })
    .setProtectedHeader({ alg: "ES256", kid: keyId, typ: "JWT" }).setIssuedAt(now).setExpirationTime(now + 15 * 60).sign(key);
  cached = { token: value, expiresAt: (now + 15 * 60) * 1000 };
  return value;
}

export class AppleApiError extends Error {
  constructor(public status: number, public details: unknown, public requestId?: string, public retryAfter?: number) { super(`Apple API request failed (${status})${requestId ? ` · request ${requestId}` : ""}`); this.name = "AppleApiError"; }
}
export class AppleAuthenticationError extends AppleApiError { constructor(details: unknown, requestId?: string) { super(401, details, requestId); this.name = "AppleAuthenticationError"; } }
export class ApplePermissionError extends AppleApiError { constructor(details: unknown, requestId?: string) { super(403, details, requestId); this.name = "ApplePermissionError"; } }
export class AppleNotFoundError extends AppleApiError { constructor(details: unknown, requestId?: string) { super(404, details, requestId); this.name = "AppleNotFoundError"; } }
export class AppleConflictError extends AppleApiError { constructor(details: unknown, requestId?: string) { super(409, details, requestId); this.name = "AppleConflictError"; } }
export class AppleValidationError extends AppleApiError { constructor(status: number, details: unknown, requestId?: string) { super(status, details, requestId); this.name = "AppleValidationError"; } }
export class AppleRateLimitError extends AppleApiError { constructor(details: unknown, requestId?: string, retryAfter?: number) { super(429, details, requestId, retryAfter); this.name = "AppleRateLimitError"; } }

function normalizedError(status: number, details: unknown, requestId?: string, retryAfter?: number) {
  if (status === 401) return new AppleAuthenticationError(details, requestId);
  if (status === 403) return new ApplePermissionError(details, requestId);
  if (status === 404) return new AppleNotFoundError(details, requestId);
  if (status === 409) return new AppleConflictError(details, requestId);
  if (status === 400 || status === 422) return new AppleValidationError(status, details, requestId);
  if (status === 429) return new AppleRateLimitError(details, requestId, retryAfter);
  return new AppleApiError(status, details, requestId, retryAfter);
}

export async function appleRequest<T>(pathOrUrl: string, init: RequestInit = {}): Promise<T> {
  const method = init.method?.toUpperCase() ?? "GET";
  const endpoint = pathOrUrl.startsWith("http") ? new URL(pathOrUrl).pathname : pathOrUrl.split("?")[0];
  for (let attempt = 0; ; attempt += 1) {
    const started = Date.now();
    const response = await fetch(pathOrUrl.startsWith("http") ? pathOrUrl : `${BASE_URL}${pathOrUrl}`, { ...init, headers: { authorization: `Bearer ${await token()}`, "content-type": "application/json", ...init.headers }, cache: "no-store" });
    const body = response.status === 204 ? null : await response.json().catch(() => null);
    const requestId = response.headers.get("x-request-id") ?? undefined;
    console.info(JSON.stringify({ event: "apple_api_request", method, endpoint, status: response.status, durationMs: Date.now() - started, requestId }));
    if (response.ok) return body as T;
    const retryHeader = response.headers.get("retry-after");
    const retryAfter = retryHeader ? Number(retryHeader) : undefined;
    if (response.status === 429 && method === "GET" && attempt < 2) {
      const delay = Number.isFinite(retryAfter) ? Math.min(retryAfter! * 1000, 30_000) : 500 * 2 ** attempt;
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    throw normalizedError(response.status, body, requestId, retryAfter);
  }
}

export async function appleListAll<T extends AppleResource>(path: string) {
  const rows: T[] = [];
  let next: string | undefined = path;
  while (next) { const page: AppleList<T> = await appleRequest(next); rows.push(...page.data); next = page.links?.next; }
  return rows;
}

export async function appleCreate<T extends AppleResource>(path: string, body: unknown) {
  return appleRequest<AppleOne<T>>(path, { method: "POST", body: JSON.stringify(body) });
}
