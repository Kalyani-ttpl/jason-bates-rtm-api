import { AsyncLocalStorage } from "node:async_hooks";
import { Injectable, InternalServerErrorException } from "@nestjs/common";

export interface TenantContext {
  tenantId: bigint;
  tenantSlug?: string;
}

/**
 * Holds the current request's tenant in AsyncLocalStorage so PrismaService can
 * scope queries without every service having to pass a tenant id around.
 */
@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<TenantContext>();

  run<T>(context: TenantContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  get(): TenantContext | undefined {
    return this.storage.getStore();
  }

  getTenantId(): bigint | undefined {
    return this.storage.getStore()?.tenantId;
  }

  requireTenantId(): bigint {
    const tenantId = this.getTenantId();
    if (tenantId === undefined) {
      throw new InternalServerErrorException("Tenant context is not set");
    }
    return tenantId;
  }
}
