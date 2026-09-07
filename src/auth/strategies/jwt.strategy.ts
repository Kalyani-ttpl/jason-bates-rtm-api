import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthenticatedUser, JwtPayload } from "../../common/constants";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWTSECRET as string,
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    if (payload.token_type !== "access") {
      throw new UnauthorizedException("Invalid token type");
    }
    if (!payload.tenant_id) {
      throw new UnauthorizedException("Token is not bound to a tenant");
    }

    return {
      id: BigInt(payload.id),
      uuid: payload.user_id,
      email: null,
      providerId: payload.provider_id ? BigInt(payload.provider_id) : null,
      tenantId: BigInt(payload.tenant_id),
      tenantSlug: payload.tenant_slug,
      isTenantAdmin: payload.admin?.isTenantAdmin ?? false,
      isSuperTenantAdmin: payload.admin?.isSuperAdmin ?? false,
      language: payload.language,
    };
  }
}
