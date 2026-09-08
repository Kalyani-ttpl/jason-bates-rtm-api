import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../common/constants";
import { ParseBigIntPipe } from "../common/pipes/parse-bigint.pipe";
import { ConsentService } from "./consent.service";
import {
  CopyConsentDto,
  CreateConsentDto,
  QueryConsentsDto,
  UpdateConsentDto,
} from "./dto/consent.dto";

@ApiTags("Consent Forms")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("library")
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Get("consent")
  @ApiOperation({ summary: "List consent forms" })
  findAll(@Query() query: QueryConsentsDto) {
    return this.consentService.findAll(query);
  }

  @Post("consent")
  @ApiOperation({ summary: "Create a consent form" })
  create(
    @Body() data: CreateConsentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.consentService.create(data, user);
  }

  @Get("additional-consent-templates")
  @ApiOperation({ summary: "Boilerplate consent bodies" })
  additionalConsentTemplates() {
    return this.consentService.additionalConsentTemplates();
  }

  @Get("consent/:id")
  @ApiOperation({ summary: "Get a consent form by id" })
  findOne(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.consentService.findOne(id);
  }

  @Get("consent/:id/preview")
  @ApiOperation({ summary: "Render a consent form for preview" })
  preview(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.consentService.preview(id);
  }

  @Post("consent/:id/copy")
  @ApiOperation({ summary: "Duplicate a consent form" })
  copy(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: CopyConsentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.consentService.copy(id, data, user);
  }

  @Patch("consent/:id")
  @ApiOperation({ summary: "Update a consent form by id" })
  update(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: UpdateConsentDto,
  ) {
    return this.consentService.update(id, data);
  }

  @Delete("consent/:id")
  @ApiOperation({ summary: "Delete a consent form by id" })
  remove(
    @Param("id", ParseBigIntPipe) id: bigint,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.consentService.remove(id, user);
  }
}
