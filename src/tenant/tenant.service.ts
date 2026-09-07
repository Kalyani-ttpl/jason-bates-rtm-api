import { Injectable, UnauthorizedException } from "@nestjs/common";
import { BaseService } from "../common/base.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TenantService extends BaseService {
  constructor(private readonly prisma: PrismaService) {
    super(TenantService.name);
  }

  /**
   * Resolves the tenant a login request belongs to. Runs unscoped because no
   * tenant context exists yet; `tenant` carries no RLS policy for that reason.
   */
  async findActiveBySlug(slug: string) {
    try {
      const tenant = await this.prisma.unscoped().tenant.findUnique({
        where: { slug },
      });

      if (!tenant) {
        throw new UnauthorizedException("Invalid credentials");
      }

      if (!tenant.is_active) {
        throw new UnauthorizedException(
          "Your tenant account is currently inactive. Please contact your administrator for assistance.",
        );
      }

      return tenant;
    } catch (error) {
      this.handleError(error, "Failed to resolve tenant");
    }
  }

  async findById(id: bigint) {
    try {
      return await this.prisma.unscoped().tenant.findUnique({ where: { id } });
    } catch (error) {
      this.handleError(error, "Failed to load tenant");
    }
  }
}
