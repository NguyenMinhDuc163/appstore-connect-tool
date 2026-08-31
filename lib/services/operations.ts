import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { appleCreate, appleListAll, appleRequest } from "@/lib/apple/client";
import type { AppleInvitation, AppleTester } from "@/lib/apple/types";
import { automateLatestBuild } from "@/lib/services/automation";
import { resolveTesterState, type TesterResolution } from "@/lib/services/tester-resolution";

type AddTesterInput = { appId: string; email: string; actorId: string; firstName?: string; lastName?: string; role?: string; groupId?: string; autoAssignBuild?: boolean };
const keyFor = (values: unknown[]) => createHash("sha256").update(JSON.stringify(values)).digest("hex");

export async function enqueueAddTester(input: AddTesterInput) {
  const normalized = { ...input, email: input.email.trim().toLowerCase() };
  const window = new Date().toISOString().slice(0, 13);
  const idempotencyKey = keyFor(["ADD_TESTER", normalized.appId, normalized.email, window]);
  return db.operation.upsert({
    where: { idempotencyKey },
    create: { kind: "ADD_TESTER", appId: normalized.appId, actorId: normalized.actorId, input: normalized, idempotencyKey, steps: { create: [{ name: "Resolve Apple state", ordinal: 1 }, { name: "Create tester and access", ordinal: 2 }, { name: "Verify", ordinal: 3 }] } },
    update: {}, include: { steps: true },
  });
}

async function targetGroup(input: AddTesterInput) {
  const [workspace, preference] = await Promise.all([db.workspace.findUnique({ where: { id: "default" } }), db.appPreference.findUnique({ where: { appId: input.appId } })]);
  const preferredId = input.groupId ?? preference?.defaultInternalGroupId ?? workspace?.defaultInternalGroupId;
  const preferred = preferredId ? await db.betaGroup.findFirst({ where: { id: preferredId, appId: input.appId, isInternal: true } }) : null;
  return { group: preferred ?? await db.betaGroup.findFirst({ where: { appId: input.appId, isInternal: true }, orderBy: { name: "asc" } }), preference };
}

async function createInvitation(input: AddTesterInput, role: string) {
  if (!input.firstName?.trim() || !input.lastName?.trim()) throw new Error("Tester first and last name are required by Apple for a new team invitation.");
  const invitation = (await appleCreate<AppleInvitation>("/v1/userInvitations", { data: { type: "userInvitations", attributes: { email: input.email, firstName: input.firstName.trim(), lastName: input.lastName.trim(), roles: [role], allAppsVisible: false, provisioningAllowed: false }, relationships: { visibleApps: { data: [{ type: "apps", id: input.appId }] } } } })).data;
  const rawJson = invitation as unknown as Prisma.InputJsonValue;
  await db.appleInvitation.upsert({ where: { id: invitation.id }, create: { id: invitation.id, email: invitation.attributes.email, firstName: invitation.attributes.firstName, lastName: invitation.attributes.lastName, expiration: invitation.attributes.expirationDate ? new Date(invitation.attributes.expirationDate) : null, state: "PENDING", rawJson }, update: { email: invitation.attributes.email, firstName: invitation.attributes.firstName, lastName: invitation.attributes.lastName, expiration: invitation.attributes.expirationDate ? new Date(invitation.attributes.expirationDate) : null, state: "PENDING", rawJson, syncedAt: new Date() } });
  return invitation;
}

async function ensureUserAppAccess(resolution: TesterResolution, appId: string) {
  if (!resolution.user || resolution.user.attributes.allAppsVisible || resolution.visibleAppIds.includes(appId)) return;
  await appleRequest(`/v1/users/${resolution.user.id}/relationships/visibleApps`, { method: "POST", body: JSON.stringify({ data: [{ type: "apps", id: appId }] }) });
}

async function configureTester(input: AddTesterInput, tester: AppleTester) {
  const { group, preference } = await targetGroup(input);
  if (!group) throw new Error("Configure an internal beta group for this app before adding internal testers.");
  const members = await appleListAll<AppleTester>(`/v1/betaGroups/${group.id}/betaTesters?filter[email]=${encodeURIComponent(input.email)}&limit=1`);
  if (!members.some(item => item.id === tester.id)) await appleRequest(`/v1/betaTesters/${tester.id}/relationships/betaGroups`, { method: "POST", body: JSON.stringify({ data: [{ type: "betaGroups", id: group.id }] }) });
  const rawJson = tester as unknown as Prisma.InputJsonValue;
  await db.$transaction([
    db.tester.upsert({ where: { id: tester.id }, create: { id: tester.id, ...tester.attributes, rawJson }, update: { ...tester.attributes, rawJson, syncedAt: new Date() } }),
    db.testerApp.upsert({ where: { testerId_appId: { testerId: tester.id, appId: input.appId } }, create: { testerId: tester.id, appId: input.appId }, update: {} }),
    db.testerGroup.upsert({ where: { testerId_groupId: { testerId: tester.id, groupId: group.id } }, create: { testerId: tester.id, groupId: group.id }, update: {} }),
  ]);
  if (input.autoAssignBuild !== false && (preference?.autoAssignLatestBuild ?? true)) await automateLatestBuild(input.appId);
  return group.id;
}

async function waitForAcceptance(operationId: string, detail: Prisma.InputJsonValue) {
  await db.operationStep.update({ where: { operationId_name: { operationId, name: "Create tester and access" } }, data: { status: "SUCCEEDED", detail } });
  await db.operationStep.update({ where: { operationId_name: { operationId, name: "Verify" } }, data: { status: "WAITING_EXTERNAL_ACTION", detail: { message: "Waiting for the tester to accept Apple's team invitation" } } });
  return db.operation.update({ where: { id: operationId }, data: { status: "WAITING_EXTERNAL_ACTION", result: detail, nextRunAt: new Date(Date.now() + 5 * 60_000) } });
}

export async function reconcileAddTester(operationId: string) {
  const operation = await db.operation.findUniqueOrThrow({ where: { id: operationId } });
  const input = operation.input as AddTesterInput;
  const resolution = await resolveTesterState(input.email);
  if (resolution.kind === "PENDING_INVITATION") return operation;
  if (resolution.kind === "APPLE_USER") await ensureUserAppAccess(resolution, input.appId);
  const tester = resolution.betaTester ?? (await appleListAll<AppleTester>(`/v1/betaTesters?filter[email]=${encodeURIComponent(input.email)}&limit=1`))[0];
  if (!tester || (tester.attributes.state && tester.attributes.state !== "ACCEPTED")) return operation;
  const groupId = await configureTester(input, tester);
  await db.operationStep.update({ where: { operationId_name: { operationId, name: "Verify" } }, data: { status: "SUCCEEDED", detail: { message: "Team membership, app access and TestFlight group verified", testerId: tester.id, groupId } } });
  return db.operation.update({ where: { id: operationId }, data: { status: "SUCCEEDED", finishedAt: new Date(), nextRunAt: null, result: { testerId: tester.id, groupId } } });
}

export async function runAddTester(operationId: string) {
  const operation = await db.operation.findUniqueOrThrow({ where: { id: operationId } });
  if (["SUCCEEDED", "WAITING_EXTERNAL_ACTION"].includes(operation.status)) return operation;
  const input = operation.input as AddTesterInput;
  await db.operation.update({ where: { id: operationId }, data: { status: "RUNNING", attempts: { increment: 1 }, startedAt: operation.startedAt ?? new Date() } });
  try {
    const resolution = await resolveTesterState(input.email);
    await db.operationStep.update({ where: { operationId_name: { operationId, name: "Resolve Apple state" } }, data: { status: "SUCCEEDED", detail: { kind: resolution.kind } } });
    const preference = await db.appPreference.findUnique({ where: { appId: input.appId } });
    const role = input.role ?? preference?.defaultTesterRole ?? "DEVELOPER";

    if (resolution.kind === "PENDING_INVITATION") return waitForAcceptance(operationId, { invitationId: resolution.invitation!.id, reused: true });
    if (resolution.kind === "APPLE_USER") {
      await ensureUserAppAccess(resolution, input.appId);
      const tester = (await appleListAll<AppleTester>(`/v1/betaTesters?filter[email]=${encodeURIComponent(input.email)}&limit=1`))[0];
      if (!tester) return waitForAcceptance(operationId, { userId: resolution.user!.id, appAccessGranted: true, message: "Waiting for Apple to expose the internal Beta Tester record" });
      const groupId = await configureTester(input, tester);
      await db.operationStep.update({ where: { operationId_name: { operationId, name: "Create tester and access" } }, data: { status: "SUCCEEDED", detail: { userId: resolution.user!.id, testerId: tester.id, groupId } } });
      await db.operationStep.update({ where: { operationId_name: { operationId, name: "Verify" } }, data: { status: "SUCCEEDED", detail: { message: "Existing user configured without another invitation" } } });
      return db.operation.update({ where: { id: operationId }, data: { status: "SUCCEEDED", result: { testerId: tester.id, groupId }, finishedAt: new Date() } });
    }

    const firstName = input.firstName ?? resolution.firstName;
    const lastName = input.lastName ?? resolution.lastName;
    const invitation = await createInvitation({ ...input, firstName, lastName }, role);
    return waitForAcceptance(operationId, { invitationId: invitation.id, reused: false });
  } catch (error) {
    const detail = error instanceof Error ? { message: error.message } : { message: "Unknown error" };
    await db.operation.update({ where: { id: operationId }, data: { status: "FAILED", error: detail, finishedAt: new Date(), nextRunAt: new Date(Date.now() + 60_000) } });
    throw error;
  }
}
