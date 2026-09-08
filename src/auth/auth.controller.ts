import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { AuthenticatedUser } from "../common/constants";
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
  @ApiOperation({ summary: "Authenticate a provider" })
  @ApiResponse({ status: 201, description: "Logged in." })
  @ApiResponse({ status: 401, description: "Invalid credentials." })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("token/refresh")
  @Throttle({ auth: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: "Exchange a refresh token for a new access token" })
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Post("logout")
  @ApiOperation({ summary: "Log out the current session" })
  logout() {
    return { detail: "Successfully logged out." };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Current provider profile and group memberships" })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user);
  }
}
