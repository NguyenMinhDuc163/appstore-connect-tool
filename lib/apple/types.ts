export type AppleResource<T extends Record<string, unknown> = Record<string, unknown>> = {
  type: string; id: string; attributes: T; relationships?: Record<string, unknown>;
};
export type AppleList<T extends AppleResource = AppleResource> = { data: T[]; links?: { next?: string }; meta?: unknown };
export type AppleOne<T extends AppleResource = AppleResource> = { data: T };
export type AppleApp = AppleResource<{ name: string; bundleId: string; sku?: string; primaryLocale?: string }>;
export type AppleBuild = AppleResource<{ version: string; processingState?: string; uploadedDate?: string; expirationDate?: string; expired?: boolean; minOsVersion?: string; usesNonExemptEncryption?: boolean }>;
export type AppleBetaGroup = AppleResource<{ name: string; isInternalGroup?: boolean; hasAccessToAllBuilds?: boolean }>;
export type AppleTester = AppleResource<{ email?: string; firstName?: string; lastName?: string; inviteType?: string; state?: string }>;
export type AppleUser = AppleResource<{ username: string; firstName?: string; lastName?: string; roles?: string[]; allAppsVisible?: boolean; provisioningAllowed?: boolean }>;
export type AppleInvitation = AppleResource<{ email: string; firstName?: string; lastName?: string; expirationDate?: string; roles?: string[]; allAppsVisible?: boolean; provisioningAllowed?: boolean }>;
export type AppleGeneric = AppleResource<Record<string, unknown>>;
export type AppleDocument<T extends AppleResource = AppleResource> = AppleList<T> & { included?: AppleGeneric[] };
