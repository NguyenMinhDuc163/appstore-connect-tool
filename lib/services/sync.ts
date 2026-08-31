import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { appleListAll } from "@/lib/apple/client";
import type { AppleApp, AppleBetaGroup, AppleBuild, AppleInvitation, AppleTester, AppleUser } from "@/lib/apple/types";
import { automateLatestBuild } from "@/lib/services/automation";

export async function syncApps() {
  const [apps, users, invitations] = await Promise.all([
    appleListAll<AppleApp>("/v1/apps?limit=200"),
    appleListAll<AppleUser>("/v1/users?limit=200"),
    appleListAll<AppleInvitation>("/v1/userInvitations?limit=200"),
  ]);
  for (const item of apps) { const rawJson=item as unknown as Prisma.InputJsonValue; await db.app.upsert({ where: { id: item.id }, create: { id: item.id, ...item.attributes, rawJson }, update: { ...item.attributes, rawJson, syncedAt: new Date() } }); }
  await db.$transaction(async tx => {
    await tx.appleUser.updateMany({ data: { active: false } });
    for (const item of users) {
      const rawJson = item as unknown as Prisma.InputJsonValue;
      await tx.appleUser.upsert({ where: { id: item.id }, create: { id: item.id, email: item.attributes.username, firstName: item.attributes.firstName, lastName: item.attributes.lastName, roles: item.attributes.roles ?? [], active: true, rawJson }, update: { email: item.attributes.username, firstName: item.attributes.firstName, lastName: item.attributes.lastName, roles: item.attributes.roles ?? [], active: true, rawJson, syncedAt: new Date() } });
    }
    const invitationIds = invitations.map(item => item.id);
    if (invitationIds.length) await tx.appleInvitation.deleteMany({ where: { id: { notIn: invitationIds } } });
    else await tx.appleInvitation.deleteMany();
    for (const item of invitations) {
      const rawJson = item as unknown as Prisma.InputJsonValue;
      await tx.appleInvitation.upsert({ where: { id: item.id }, create: { id: item.id, email: item.attributes.email, firstName: item.attributes.firstName, lastName: item.attributes.lastName, expiration: item.attributes.expirationDate ? new Date(item.attributes.expirationDate) : null, state: "PENDING", rawJson }, update: { email: item.attributes.email, firstName: item.attributes.firstName, lastName: item.attributes.lastName, expiration: item.attributes.expirationDate ? new Date(item.attributes.expirationDate) : null, state: "PENDING", rawJson, syncedAt: new Date() } });
    }
  });
  await db.workspace.upsert({ where: { id: "default" }, create: { id: "default", lastAppleRequestAt: new Date(), lastAppleVerifiedAt: new Date() }, update: { lastAppleRequestAt: new Date(), lastAppleVerifiedAt: new Date() } });
  await db.appleConnection.upsert({where:{id:"default"},create:{id:"default",workspaceId:"default",issuerIdHint:process.env.APPLE_ISSUER_ID?.slice(0,8),keyId:process.env.APPLE_KEY_ID,status:"CONNECTED",lastRequestAt:new Date(),lastVerifiedAt:new Date()},update:{issuerIdHint:process.env.APPLE_ISSUER_ID?.slice(0,8),keyId:process.env.APPLE_KEY_ID,status:"CONNECTED",lastRequestAt:new Date(),lastVerifiedAt:new Date(),lastError:undefined}});
  return apps.length;
}

export async function syncAppData(appId: string) {
  const [builds, groups, testers] = await Promise.all([
    appleListAll<AppleBuild>(`/v1/apps/${appId}/builds?limit=200`),
    appleListAll<AppleBetaGroup>(`/v1/apps/${appId}/betaGroups?limit=200`),
    appleListAll<AppleTester>(`/v1/betaTesters?filter[apps]=${appId}&limit=200`),
  ]);
  const [groupMemberships,groupBuilds]=await Promise.all([
    Promise.all(groups.map(async group=>({groupId:group.id,testers:await appleListAll<AppleTester>(`/v1/betaGroups/${group.id}/betaTesters?limit=200`)}))),
    Promise.all(groups.map(async group=>({groupId:group.id,builds:await appleListAll<AppleBuild>(`/v1/betaGroups/${group.id}/builds?limit=200`)}))),
  ]);
  await db.$transaction(async tx => {
    for (const item of builds) { const rawJson=item as unknown as Prisma.InputJsonValue; await tx.build.upsert({ where: { id: item.id }, create: { id: item.id, appId, version: item.attributes.version, processingState: item.attributes.processingState, uploadedAt: item.attributes.uploadedDate ? new Date(item.attributes.uploadedDate) : null, expirationDate: item.attributes.expirationDate ? new Date(item.attributes.expirationDate) : null, expired: item.attributes.expired ?? false,minOsVersion:item.attributes.minOsVersion,encryptionUsed:item.attributes.usesNonExemptEncryption, rawJson }, update: { version: item.attributes.version, processingState: item.attributes.processingState, uploadedAt: item.attributes.uploadedDate ? new Date(item.attributes.uploadedDate) : null, expirationDate: item.attributes.expirationDate ? new Date(item.attributes.expirationDate) : null, expired: item.attributes.expired ?? false,minOsVersion:item.attributes.minOsVersion,encryptionUsed:item.attributes.usesNonExemptEncryption, rawJson, syncedAt: new Date() } }); }
    for (const item of groups) { const rawJson=item as unknown as Prisma.InputJsonValue; await tx.betaGroup.upsert({ where: { id: item.id }, create: { id: item.id, appId, name: item.attributes.name, isInternal: item.attributes.isInternalGroup ?? false, hasAccessToAllBuilds: item.attributes.hasAccessToAllBuilds ?? false, rawJson }, update: { name: item.attributes.name, isInternal: item.attributes.isInternalGroup ?? false, hasAccessToAllBuilds: item.attributes.hasAccessToAllBuilds ?? false, rawJson, syncedAt: new Date() } }); }
    for (const item of testers) { const rawJson=item as unknown as Prisma.InputJsonValue; await tx.tester.upsert({ where: { id: item.id }, create: { id: item.id, ...item.attributes, rawJson }, update: { ...item.attributes, rawJson, syncedAt: new Date() } }); await tx.testerApp.upsert({ where: { testerId_appId: { testerId: item.id, appId } }, create: { testerId: item.id, appId }, update: {} }); }
    for(const membership of groupMemberships){await tx.testerGroup.deleteMany({where:{groupId:membership.groupId}});for(const item of membership.testers){const rawJson=item as unknown as Prisma.InputJsonValue;await tx.tester.upsert({where:{id:item.id},create:{id:item.id,...item.attributes,rawJson},update:{...item.attributes,rawJson,syncedAt:new Date()}});await tx.testerGroup.create({data:{testerId:item.id,groupId:membership.groupId}})}}
    for(const membership of groupBuilds){await tx.buildGroup.deleteMany({where:{groupId:membership.groupId}});for(const item of membership.builds)await tx.buildGroup.upsert({where:{buildId_groupId:{buildId:item.id,groupId:membership.groupId}},create:{buildId:item.id,groupId:membership.groupId},update:{}})}
  });
  const automation=await automateLatestBuild(appId);
  return { builds: builds.length, groups: groups.length, testers: testers.length,automations:automation?1:0 };
}
