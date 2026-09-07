import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtPayload, TENANT_HEADER } from '../common/constants';
import { TenantContextService } from './tenant-context.service';

/**
 * Establishes the tenant context for the request from a verified access token,
 * falling back to the tenant header. Requests without either continue with no
 * context; the RLS policies then match no rows and the auth guard rejects them.
 */
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly tenantContext: TenantContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const tenant = this.resolveTenant(req);
    if (!tenant) {
      return next();
    }
    this.tenantContext.run(tenant, () => next());
  }

  private resolveTenant(req: Request) {
    const authorization = req.headers.authorization;
    if (authorization?.startsWith('Bearer ')) {
      try {
        const payload = jwt.verify(
          authorization.slice(7),
          process.env.JWTSECRET as string,
        ) as JwtPayload;
        if (payload?.tenant_id) {
          return {
            tenantId: BigInt(payload.tenant_id),
            tenantSlug: payload.tenant_slug,
          };
        }
      } catch {
        return undefined;
      }
    }

    const header = req.headers[TENANT_HEADER];
    if (typeof header === 'string' && /^\d+$/.test(header)) {
      return { tenantId: BigInt(header) };
    }
    return undefined;
  }
}
