-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('NEW', 'TRIAGED', 'IN_PROGRESS', 'RESOLVED', 'IGNORED');

-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OperationKind" ADD VALUE 'SYNC_DEVELOPER_RESOURCES';
ALTER TYPE "OperationKind" ADD VALUE 'SYNC_FEEDBACK';
ALTER TYPE "OperationKind" ADD VALUE 'SYNC_RELEASES';
ALTER TYPE "OperationKind" ADD VALUE 'SYNC_REVIEWS';
ALTER TYPE "OperationKind" ADD VALUE 'SYNC_ANALYTICS';
ALTER TYPE "OperationKind" ADD VALUE 'REGISTER_DEVICE';
ALTER TYPE "OperationKind" ADD VALUE 'REVOKE_CERTIFICATE';
ALTER TYPE "OperationKind" ADD VALUE 'CREATE_PROFILE';
ALTER TYPE "OperationKind" ADD VALUE 'RELEASE_VERSION';

-- CreateTable
CREATE TABLE "WorkspaceMember" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppleConnection" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "workspaceId" TEXT NOT NULL,
    "issuerIdHint" TEXT,
    "keyId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
    "lastVerifiedAt" TIMESTAMP(3),
    "lastRequestAt" TIMESTAMP(3),
    "lastError" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppleConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppleUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "roles" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "rawJson" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppleUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppleInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "expiration" TIMESTAMP(3),
    "state" TEXT,
    "rawJson" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppleInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppPreference" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "defaultTesterRole" TEXT NOT NULL DEFAULT 'DEVELOPER',
    "defaultInternalGroupId" TEXT,
    "defaultExternalGroupId" TEXT,
    "autoAssignLatestBuild" BOOLEAN NOT NULL DEFAULT true,
    "autoAddAcceptedTester" BOOLEAN NOT NULL DEFAULT true,
    "autoSyncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackItem" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "buildId" TEXT,
    "testerId" TEXT,
    "type" TEXT NOT NULL,
    "comment" TEXT,
    "email" TEXT,
    "deviceModel" TEXT,
    "osVersion" TEXT,
    "platform" TEXT,
    "createdDate" TIMESTAMP(3),
    "status" "FeedbackStatus" NOT NULL DEFAULT 'NEW',
    "screenshotUrl" TEXT,
    "rawJson" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "displayName" TEXT,
    "certificateType" TEXT NOT NULL,
    "serialNumber" TEXT,
    "platform" TEXT,
    "expirationDate" TIMESTAMP(3),
    "activated" BOOLEAN NOT NULL DEFAULT true,
    "rawJson" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegisteredDevice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "udid" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "deviceClass" TEXT,
    "status" TEXT NOT NULL,
    "model" TEXT,
    "addedDate" TIMESTAMP(3),
    "rawJson" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegisteredDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleId" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "seedId" TEXT,
    "capabilities" JSONB,
    "rawJson" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BundleId_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProvisioningProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "profileType" TEXT NOT NULL,
    "profileState" TEXT NOT NULL,
    "uuid" TEXT,
    "createdDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "bundleIdRef" TEXT,
    "rawJson" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProvisioningProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppStoreVersion" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "versionString" TEXT NOT NULL,
    "appStoreState" TEXT,
    "appVersionState" TEXT,
    "releaseType" TEXT,
    "earliestReleaseDate" TIMESTAMP(3),
    "createdDate" TIMESTAMP(3),
    "rawJson" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppStoreVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerReview" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "reviewerNickname" TEXT,
    "territory" TEXT,
    "createdDate" TIMESTAMP(3),
    "responseBody" TEXT,
    "responseState" TEXT,
    "rawJson" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsReport" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "requestId" TEXT,
    "name" TEXT,
    "category" TEXT,
    "accessType" TEXT,
    "stoppedDueToInactivity" BOOLEAN NOT NULL DEFAULT false,
    "rawJson" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionLookup" (
    "id" TEXT NOT NULL,
    "transactionIdHash" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "statusResponse" JSONB,
    "transactionHistory" JSONB,
    "refundHistory" JSONB,
    "requestedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionLookup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT,
    "payload" JSONB NOT NULL,
    "status" "WebhookStatus" NOT NULL DEFAULT 'RECEIVED',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "error" JSONB,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationRule" (
    "id" TEXT NOT NULL,
    "appId" TEXT,
    "type" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkspaceMember_userId_idx" ON "WorkspaceMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_workspaceId_userId_key" ON "WorkspaceMember"("workspaceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "AppleConnection_workspaceId_key" ON "AppleConnection"("workspaceId");

-- CreateIndex
CREATE INDEX "AppleUser_email_idx" ON "AppleUser"("email");

-- CreateIndex
CREATE INDEX "AppleInvitation_email_idx" ON "AppleInvitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AppPreference_appId_key" ON "AppPreference"("appId");

-- CreateIndex
CREATE INDEX "FeedbackItem_appId_createdDate_idx" ON "FeedbackItem"("appId", "createdDate");

-- CreateIndex
CREATE INDEX "FeedbackItem_status_idx" ON "FeedbackItem"("status");

-- CreateIndex
CREATE INDEX "Certificate_expirationDate_idx" ON "Certificate"("expirationDate");

-- CreateIndex
CREATE UNIQUE INDEX "RegisteredDevice_udid_key" ON "RegisteredDevice"("udid");

-- CreateIndex
CREATE UNIQUE INDEX "BundleId_identifier_key" ON "BundleId"("identifier");

-- CreateIndex
CREATE INDEX "ProvisioningProfile_expirationDate_idx" ON "ProvisioningProfile"("expirationDate");

-- CreateIndex
CREATE INDEX "AppStoreVersion_appId_createdDate_idx" ON "AppStoreVersion"("appId", "createdDate");

-- CreateIndex
CREATE INDEX "CustomerReview_appId_createdDate_idx" ON "CustomerReview"("appId", "createdDate");

-- CreateIndex
CREATE INDEX "CustomerReview_rating_idx" ON "CustomerReview"("rating");

-- CreateIndex
CREATE INDEX "AnalyticsReport_appId_idx" ON "AnalyticsReport"("appId");

-- CreateIndex
CREATE INDEX "SubscriptionLookup_transactionIdHash_createdAt_idx" ON "SubscriptionLookup"("transactionIdHash", "createdAt");

-- CreateIndex
CREATE INDEX "AutomationRule_appId_enabled_idx" ON "AutomationRule"("appId", "enabled");
