import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { BaseService } from "../common/base.service";
import { AuthenticatedUser, JwtPayload } from "../common/constants";
import { PrismaService } from "../prisma/prisma.service";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../common/cookie";
import { LoginDto } from "./dto/auth.dto";

@Injectable()
export class AuthService extends BaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    super(AuthService.name);
  }

  /**
   * Authenticates a provider and returns access and refresh tokens plus the
   * provider's profile and group memberships.
   */
  async login(loginDto: LoginDto) {
    const prisma = this.prisma;

    const user = await prisma.user.findFirst({
      where: { email: loginDto.email, isDeleted: false },
    });
    if (!user?.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        "Your account has been disabled. Please contact your administrator",
      );
    }

    const provider = await prisma.provider.findFirst({
      where: { user_id: user.id, is_deleted: false },
    });

    const memberships = provider
      ? await prisma.providerGroupMember.findMany({
          where: { provider_id: provider.id },
          include: { provider_group: true },
        })
      : [];

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload: JwtPayload = {
      token_type: "access",
      user_id: user.uuid,
      id: Number(user.id),
      jti: this.generateUUID(),
      provider_id: provider ? Number(provider.id) : null,
      language: provider?.language ?? "en",
    };

    return {
      access: this.signAccessToken(payload),
      refresh: this.signRefreshToken(payload, loginDto.remember_me ?? false),
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        picture: user.picture,
        is_provider: user.isProvider,
      },
      provider,
      provider_groups: memberships.map((m) => m.provider_group),
    };
  }

  /**
   * Swaps a valid refresh token for a new access and refresh pair. The refresh
   * token is rotated too, keeping its `remember_me` so the controller re-issues
   * the cookie with the same lifetime.
   */
  async refreshToken(refresh?: string) {
    if (!refresh) {
      throw new UnauthorizedException("Missing refresh token");
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refresh, {
        secret: process.env.JWTSECRET,
      });
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    if (payload.token_type !== "refresh") {
      throw new UnauthorizedException("Invalid token type");
    }

    // Rebuilt field by field: `iat`/`exp` must not carry over, or the new
    // tokens would inherit the old expiry.
    const rememberMe = payload.remember_me ?? false;
    const accessPayload: JwtPayload = {
      token_type: "access",
      user_id: payload.user_id,
      id: payload.id,
      jti: this.generateUUID(),
      provider_id: payload.provider_id,
      language: payload.language,
    };

    return {
      access: this.signAccessToken(accessPayload),
      refresh: this.signRefreshToken(accessPayload, rememberMe),
      remember_me: rememberMe,
    };
  }

  /** Returns the signed-in provider's profile and group memberships. */
  async me(user: AuthenticatedUser) {
    const prisma = this.prisma;

    const account = await prisma.user.findUnique({
      where: { id: user.id },
    });
    this.throwNotFoundError(account, "User not found");

    const provider = user.providerId
      ? await prisma.provider.findUnique({ where: { id: user.providerId } })
      : null;

    const memberships = provider
      ? await prisma.providerGroupMember.findMany({
          where: { provider_id: provider.id },
          include: { provider_group: true },
        })
      : [];

    return {
      user: {
        id: account!.id,
        uuid: account!.uuid,
        email: account!.email,
        first_name: account!.firstName,
        last_name: account!.lastName,
        picture: account!.picture,
      },
      provider,
      provider_groups: memberships.map((m) => m.provider_group),
    };
  }

  private signAccessToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      secret: process.env.JWTSECRET,
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  private signRefreshToken(payload: JwtPayload, rememberMe: boolean) {
    return this.jwtService.sign(
      {
        ...payload,
        token_type: "refresh",
        jti: this.generateUUID(),
        remember_me: rememberMe,
      },
      {
        secret: process.env.JWTSECRET,
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      },
    );
  }
}
