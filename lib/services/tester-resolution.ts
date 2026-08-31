import { Prisma } from "@prisma/client";
import { appleListAll, appleRequest } from "@/lib/apple/client";
import type { AppleDocument, AppleInvitation, AppleTester, AppleUser } from "@/lib/apple/types";
import { db } from "@/lib/db";

type ResolutionKind = "APPLE_USER" | "PENDING_INVITATION" | "BETA_TESTER" | "LOCAL_CACHE" | "NEW_USER";

export type TesterResolution = {
  kind: ResolutionKind;
  needsNames: boolean;
  firstName?: string;
  lastName?: string;
  user?: AppleUser;
  invitation?: AppleInvitation;
  betaTester?: AppleTester;
  visibleAppIds: string[];
};

function relatedIds(resource: { relationships?: Record<string, unknown> } | undefined, name: string) {
  const relation = resource?.relationships?.[name] as { data?: Array<{ id?: string }> } | undefined;
  return (relation?.data ?? []).flatMap(item => item.id ? [item.id] : []);
}

async function cacheUser(user: AppleUser) {
  const rawJson = user as unknown as Prisma.InputJsonValue;
  await db.appleUser.upsert({ where: { id: user.id }, create: { id: user.id, email: user.attributes.username, firstName: user.attributes.firstName, lastName: user.attributes.lastName, roles: user.attributes.roles ?? [], active: true, rawJson }, update: { email: user.attributes.username, firstName: user.attributes.firstName, lastName: user.attributes.lastName, roles: user.attributes.roles ?? [], active: true, rawJson, syncedAt: new Date() } });
}

async function cacheInvitation(invitation: AppleInvitation) {
  const rawJson = invitation as unknown as Prisma.InputJsonValue;
  await db.appleInvitation.upsert({ where: { id: invitation.id }, create: { id: invitation.id, email: invitation.attributes.email, firstName: invitation.attributes.firstName, lastName: invitation.attributes.lastName, expiration: invitation.attributes.expirationDate ? new Date(invitation.attributes.expirationDate) : null, state: "PENDING", rawJson }, update: { email: invitation.attributes.email, firstName: invitation.attributes.firstName, lastName: invitation.attributes.lastName, expiration: invitation.attributes.expirationDate ? new Date(invitation.attributes.expirationDate) : null, state: "PENDING", rawJson, syncedAt: new Date() } });
}

export async function resolveTesterState(email: string): Promise<TesterResolution> {
  const normalized = email.trim().toLowerCase();
  const users = await appleRequest<AppleDocument<AppleUser>>(`/v1/users?filter[username]=${encodeURIComponent(normalized)}&include=visibleApps&limit=1`);
  if (users.data[0]) {
    await cacheUser(users.data[0]);
    return { kind: "APPLE_USER", needsNames: false, firstName: users.data[0].attributes.firstName, lastName: users.data[0].attributes.lastName, user: users.data[0], visibleAppIds: relatedIds(users.data[0], "visibleApps") };
  }

  const invitations = await appleRequest<AppleDocument<AppleInvitation>>(`/v1/userInvitations?filter[email]=${encodeURIComponent(normalized)}&include=visibleApps&limit=1`);
  if (invitations.data[0]) {
    await cacheInvitation(invitations.data[0]);
    return { kind: "PENDING_INVITATION", needsNames: false, firstName: invitations.data[0].attributes.firstName, lastName: invitations.data[0].attributes.lastName, invitation: invitations.data[0], visibleAppIds: relatedIds(invitations.data[0], "visibleApps") };
  }

  const [betaTester] = await appleListAll<AppleTester>(`/v1/betaTesters?filter[email]=${encodeURIComponent(normalized)}&include=apps,betaGroups&limit=1`);
  if (betaTester) {
    return { kind: "BETA_TESTER", needsNames: !betaTester.attributes.firstName || !betaTester.attributes.lastName, firstName: betaTester.attributes.firstName, lastName: betaTester.attributes.lastName, betaTester, visibleAppIds: relatedIds(betaTester, "apps") };
  }

  const [localUser, localInvitation, localTester] = await Promise.all([
    db.appleUser.findFirst({ where: { email: { equals: normalized, mode: "insensitive" }, active: true } }),
    db.appleInvitation.findFirst({ where: { email: { equals: normalized, mode: "insensitive" } } }),
    db.tester.findFirst({ where: { email: { equals: normalized, mode: "insensitive" } } }),
  ]);
  const cached = localUser ?? localInvitation ?? localTester;
  if (cached) return { kind: "LOCAL_CACHE", needsNames: !cached.firstName || !cached.lastName, firstName: cached.firstName ?? undefined, lastName: cached.lastName ?? undefined, visibleAppIds: [] };
  return { kind: "NEW_USER", needsNames: true, visibleAppIds: [] };
}

