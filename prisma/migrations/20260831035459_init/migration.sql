-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'DEVELOPER', 'SUPPORT', 'VIEWER');

-- CreateEnum
CREATE TYPE "OperationStatus" AS ENUM ('PENDING', 'RUNNING', 'WAITING_EXTERNAL_ACTION', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OperationKind" AS ENUM ('SYNC_APPS', 'SYNC_BUILDS', 'SYNC_TESTERS', 'ADD_TESTER', 'REMOVE_TESTER', 'ASSIGN_BUILD', 'VERIFY_CONNECTION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Apple Ops',
    "defaultAppId" TEXT,
    "defaultInternalGroupId" TEXT,
    "autoAssignLatestBuild" BOOLEAN NOT NULL DEFAULT true,
    "lastAppleVerifiedAt" TIMESTAMP(3),
    "lastAppleRequestAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "App" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "sku" TEXT,
    "primaryLocale" TEXT,
    "rawJson" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Build" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "processingState" TEXT,
    "uploadedAt" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "expired" BOOLEAN NOT NULL DEFAULT false,
    "rawJson" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Build_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetaGroup" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "hasAccessToAllBuilds" BOOLEAN NOT NULL DEFAULT false,
    "rawJson" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BetaGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tester" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "inviteType" TEXT,
    "state" TEXT,
    "rawJson" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TesterApp" (
    "testerId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,

    CONSTRAINT "TesterApp_pkey" PRIMARY KEY ("testerId","appId")
);

-- CreateTable
CREATE TABLE "TesterGroup" (
    "testerId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "TesterGroup_pkey" PRIMARY KEY ("testerId","groupId")
);

-- CreateTable
CREATE TABLE "Operation" (
    "id" TEXT NOT NULL,
    "kind" "OperationKind" NOT NULL,
    "status" "OperationStatus" NOT NULL DEFAULT 'PENDING',
    "idempotencyKey" TEXT NOT NULL,
    "appId" TEXT,
    "actorId" TEXT,
    "input" JSONB NOT NULL,
    "result" JSONB,
    "error" JSONB,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextRunAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationStep" (
    "id" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "OperationStatus" NOT NULL DEFAULT 'PENDING',
    "ordinal" INTEGER NOT NULL,
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Build_appId_uploadedAt_idx" ON "Build"("appId", "uploadedAt");

-- CreateIndex
CREATE INDEX "BetaGroup_appId_idx" ON "BetaGroup"("appId");

-- CreateIndex
CREATE INDEX "Tester_email_idx" ON "Tester"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Operation_idempotencyKey_key" ON "Operation"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Operation_status_nextRunAt_idx" ON "Operation"("status", "nextRunAt");

-- CreateIndex
CREATE INDEX "Operation_appId_createdAt_idx" ON "Operation"("appId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OperationStep_operationId_name_key" ON "OperationStep"("operationId", "name");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "Build" ADD CONSTRAINT "Build_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetaGroup" ADD CONSTRAINT "BetaGroup_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TesterApp" ADD CONSTRAINT "TesterApp_testerId_fkey" FOREIGN KEY ("testerId") REFERENCES "Tester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TesterApp" ADD CONSTRAINT "TesterApp_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TesterGroup" ADD CONSTRAINT "TesterGroup_testerId_fkey" FOREIGN KEY ("testerId") REFERENCES "Tester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TesterGroup" ADD CONSTRAINT "TesterGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "BetaGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationStep" ADD CONSTRAINT "OperationStep_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
