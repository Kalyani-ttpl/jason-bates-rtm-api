import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ParseBigIntPipe } from "../common/pipes/parse-bigint.pipe";
import { CreateProviderDto } from "./dto/providers.dto";
import { ProvidersService } from "./providers.service";

@ApiTags("Providers")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("provider-groups")
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post(":id/providers")
  @ApiOperation({
    summary: "Create a new provider for a specific provider group",
  })
  @ApiResponse({ status: 201, description: "Provider created." })
  @ApiResponse({ status: 400, description: "Email or NPI already exists." })
  createProvider(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() createProviderDto: CreateProviderDto,
  ) {
    return this.providersService.createProvider(createProviderDto, id);
  }
}
