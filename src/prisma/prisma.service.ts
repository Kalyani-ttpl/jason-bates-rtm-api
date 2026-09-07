import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
import { TenantContextService } from "./tenant-context.service";

export type TenantScopedClient = ReturnType<PrismaService["buildScopedClient"]>;

/**
 * Prisma access for the application. `client` is scoped to the tenant in the
 * current request context: each operation is paired with a `set_config` in one
 * transaction so it lands on the same connection as the query, which is what
 * the row-level security policies read. Use `unscoped()` only where no tenant
 * exists yet, such as resolving a tenant during login.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly base: PrismaClient;
  readonly client: TenantScopedClient;

  constructor(private readonly tenantContext: TenantContextService) {
    this.base = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
      }),
    });
    this.client = this.buildScopedClient();
  }

  async onModuleInit() {
    await this.base.$connect();
    await this.warnIfRlsIsBypassed();
  }

  async onModuleDestroy() {
    await this.base.$disconnect();
  }

  unscoped(): PrismaClient {
    return this.base;
  }

  /**
   * Runs a callback inside one interactive transaction with the tenant setting
   * applied, for multi-statement work and raw queries that the per-operation
   * wrapper cannot cover.
   */
  async runInTenantTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    const tenantId = this.tenantContext.getTenantId();
    return this.base.$transaction(async (tx) => {
      if (tenantId !== undefined) {
        await tx.$executeRaw`SELECT set_config('app.tenant_id', ${String(tenantId)}, TRUE)`;
      }
      return callback(tx);
    });
  }

  private buildScopedClient() {
    const base = this.base;
    const tenantContext = this.tenantContext;

    return base.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const tenantId = tenantContext.getTenantId();
            if (tenantId === undefined) {
              return query(args);
            }
            const [, result] = await base.$transaction([
              base.$executeRaw`SELECT set_config('app.tenant_id', ${String(tenantId)}, TRUE)`,
              query(args) as Prisma.PrismaPromise<unknown>,
            ]);
            return result;
          },
        },
      },
    });
  }

  private async warnIfRlsIsBypassed() {
    const [role] = await this.base.$queryRaw<
      { rolsuper: boolean; rolbypassrls: boolean; rolname: string }[]
    >`SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user`;

    if (role?.rolsuper || role?.rolbypassrls) {
      this.logger.warn(
        `Connected as "${role.rolname}", which bypasses row-level security. ` +
          `Tenant isolation is NOT enforced. Set DATABASE_URL_APP to a non-superuser, non-owner role.`,
      );
    }
  }
}
