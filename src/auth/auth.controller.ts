import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Request, Response } from "express";
import { AuthenticatedUser } from "../common/constants";
import {
  clearAuthCookies,
  COOKIE_NAMES,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "../common/cookie";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { LoginDto, RefreshTokenDto } from "./dto/auth.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @Throttle({ auth: { limit: 5, ttl: 900000 } })
  @ApiOperation({
    summary: "Authenticate a provider",
    description:
      "Sets httpOnly access_token and refresh_token cookies for the browser app. The tokens are also returned in the body for Swagger and API tools.",
  })
  @ApiResponse({ status: 201, description: "Logged in." })
  @ApiResponse({ status: 401, description: "Invalid credentials." })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);
    setAccessTokenCookie(res, result.access);
    setRefreshTokenCookie(res, result.refresh, loginDto.remember_me);
    return result;
  }

  @Post("token/refresh")
  @HttpCode(200)
  @Throttle({ auth: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: "Exchange a refresh token for a new token pair",
    description:
      "Reads the refresh_token cookie, falling back to `refresh` in the body. Rotates both tokens and resets both cookies.",
  })
  @ApiResponse({
    status: 401,
    description: "Missing or invalid refresh token.",
  })
  async refreshToken(
    @Req() req: Request,
    @Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string> | undefined;
    const result = await this.authService.refreshToken(
      cookies?.[COOKIE_NAMES.REFRESH_TOKEN] ?? dto.refresh,
    );
    setAccessTokenCookie(res, result.access);
    setRefreshTokenCookie(res, result.refresh, result.remember_me);
    return { access: result.access, refresh: result.refresh };
  }

  @Post("logout")
  @HttpCode(200)
  @ApiOperation({
    summary: "Log out the current session",
    description:
      "Clears the auth cookies. Safe to call when already logged out.",
  })
  logout(@Res({ passthrough: true }) res: Response) {
    clearAuthCookies(res);
    return { detail: "Successfully logged out." };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCookieAuth(COOKIE_NAMES.ACCESS_TOKEN)
  @ApiOperation({ summary: "Current provider profile and group memberships" })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user);
  }
}
