export interface JwtPayload {
  token_type: "access" | "refresh";
  user_id: string;
  id: number;
  jti: string;
  admin: {
    userId: number;
    isTenantAdmin: boolean;
    isSuperAdmin: boolean;
  };
  provider_id: number | null;
  language: string;
  tenant_id: number;
  tenant_slug: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: bigint;
  uuid: string;
  email: string | null;
  providerId: bigint | null;
  tenantId: bigint;
  tenantSlug: string;
  isTenantAdmin: boolean;
  isSuperTenantAdmin: boolean;
  language: string;
}

export const TENANT_HEADER = "tenant-header";

export const PROVIDER_ROLES = {
  PHYSICIAN: "physician",
  NURSE: "nurse",
  CARE_MANAGER: "care_manager",
  BILLER: "biller",
  ADMIN: "admin",
} as const;

export const PROVIDER_PHYSICIAN_ROLES: Record<string, boolean> = {
  [PROVIDER_ROLES.PHYSICIAN]: true,
};

export const PROVIDER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  INVITED: "invited",
} as const;
