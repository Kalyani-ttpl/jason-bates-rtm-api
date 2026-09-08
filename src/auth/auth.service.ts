import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { BaseService } from "../common/base.service";
import { AuthenticatedUser, JwtPayload } from "../common/constants";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto, RefreshTokenDto } from "./dto/auth.dto";

const ACCESS_TOKEN_EXPIRES_IN = "1h";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

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

    const user = await prisma.user_account.findFirst({
      where: { email: loginDto.email, is_deleted: false },
    });
    if (!user?.password) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.is_active) {
      throw new UnauthorizedException(
        "Your account has been disabled. Please contact your administrator",
      );
    }

    const provider = await prisma.provider.findFirst({
      where: { user_id: user.id, is_deleted: false },
    });

    const memberships = provider
      ? await prisma.provider_group_member.findMany({
          where: { provider_id: provider.id },
          include: { provider_group: true },
        })
      : [];

    await prisma.user_account.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    const payload: JwtPayload = {
      token_type: "access",
      user_id: user.uuid,
      id: Number(user.id),
      jti: this.generateUUID(),
      admin: {
        userId: Number(user.id),
        isTenantAdmin: user.is_tenant_admin ?? false,
        isSuperAdmin: user.is_super_tenant_admin ?? false,
      },
      provider_id: provider ? Number(provider.id) : null,
      language: provider?.language ?? "en",
    };

    return {
      access: this.signAccessToken(payload),
      refresh: this.signRefreshToken(payload),
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        picture: user.picture,
        is_provider: user.is_provider,
        is_tenant_admin: user.is_tenant_admin,
        is_super_tenant_admin: user.is_super_tenant_admin,
      },
      provider,
      provider_groups: memberships.map((m) => m.provider_group),
    };
  }

  /** Issues a new access token from a valid refresh token. */
  async refreshToken(dto: RefreshTokenDto) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(dto.refresh, {
        secret: process.env.JWTSECRET,
      });
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    if (payload.token_type !== "refresh") {
      throw new UnauthorizedException("Invalid token type");
    }

    const accessPayload: JwtPayload = {
      ...payload,
      token_type: "access",
      jti: this.generateUUID(),
    };
    delete accessPayload.iat;
    delete accessPayload.exp;

    return { access: this.signAccessToken(accessPayload) };
  }

  /** Returns the signed-in provider's profile and group memberships. */
  async me(user: AuthenticatedUser) {
    const prisma = this.prisma;

    const account = await prisma.user_account.findUnique({
      where: { id: user.id },
    });
    this.throwNotFoundError(account, "User not found");

    const provider = user.providerId
      ? await prisma.provider.findUnique({ where: { id: user.providerId } })
      : null;

    const memberships = provider
      ? await prisma.provider_group_member.findMany({
          where: { provider_id: provider.id },
          include: { provider_group: true },
        })
      : [];

    return {
      user: {
        id: account!.id,
        uuid: account!.uuid,
        email: account!.email,
        first_name: account!.first_name,
        last_name: account!.last_name,
        picture: account!.picture,
        is_tenant_admin: account!.is_tenant_admin,
        is_super_tenant_admin: account!.is_super_tenant_admin,
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

  private signRefreshToken(payload: JwtPayload) {
    return this.jwtService.sign(
      { ...payload, token_type: "refresh", jti: this.generateUUID() },
      {
        secret: process.env.JWTSECRET,
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      },
    );
  }
}
