import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import * as jwt from "jsonwebtoken";
import { COOKIE_NAMES } from "../../common/cookie";
import { AuthenticatedUser, JwtPayload } from "../../common/constants";

/**
 * Accepts the access token from the `access_token` cookie (browser app) or an
 * `Authorization: Bearer` header (Swagger, API tools). Modelled on Alvin's guard.
 *
 * Deliberately free of injected dependencies, so any module can use it
 * without importing the JWT module.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();

    const candidates = extractTokens(request);
    if (!candidates.length) {
      throw new UnauthorizedException("Missing authentication token");
    }

    for (const token of candidates) {
      const payload = verifyAccessToken(token);
      if (payload) {
        request.user = toAuthenticatedUser(payload);
        return true;
      }
    }

    throw new UnauthorizedException("Invalid or expired token");
  }
}

/**
 * Header first, then cookie, and both are tried. After `/auth/token/refresh`
 * rotates the tokens, a client retrying with its old header would otherwise
 * 401 even though the fresh cookie is valid.
 */
export function extractTokens(request: Request): string[] {
  const tokens: string[] = [];

  const [type, headerToken] = request.headers.authorization?.split(" ") ?? [];
  // A client that interpolates a missing token sends the literal "undefined".
  if (
    type === "Bearer" &&
    headerToken &&
    headerToken !== "undefined" &&
    headerToken !== "null"
  ) {
    tokens.push(headerToken);
  }

  const cookies = request.cookies as Record<string, string> | undefined;
  const cookieToken = cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
  if (cookieToken && cookieToken !== tokens[0]) {
    tokens.push(cookieToken);
  }

  return tokens;
}

/** Only an unexpired access token counts; a refresh token must not authenticate. */
function verifyAccessToken(token: string): JwtPayload | null {
  try {
    const payload = jwt.verify(
      token,
      process.env.JWTSECRET as string,
    ) as JwtPayload;
    return payload.token_type === "access" ? payload : null;
  } catch {
    return null;
  }
}

function toAuthenticatedUser(payload: JwtPayload): AuthenticatedUser {
  return {
    id: BigInt(payload.id),
    uuid: payload.user_id,
    email: null,
    providerId: payload.provider_id ? BigInt(payload.provider_id) : null,
    language: payload.language,
  };
}
