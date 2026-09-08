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
import {
  CreateTemplateDto,
  QueryTemplatesDto,
  UpdateTemplateDto,
} from "./dto/template.dto";
import { TemplateService } from "./template.service";

@ApiTags("Templates")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("library")
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post("bulk-communication-templates")
  @ApiOperation({ summary: "Create a bulk communication template" })
  create(
    @Body() data: CreateTemplateDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.templateService.create(data, user);
  }

  @Get("bulk-communication-templates")
  @ApiOperation({ summary: "List bulk communication templates" })
  findAll(@Query() query: QueryTemplatesDto) {
    return this.templateService.findAll(query);
  }

  @Get("bulk-communication-templates/sms-templates")
  @ApiOperation({ summary: "List SMS templates only" })
  findSmsTemplates(@Query() query: QueryTemplatesDto) {
    return this.templateService.findSmsTemplates(query);
  }

  @Patch("bulk-communication-templates/:id")
  @ApiOperation({ summary: "Update a template by id" })
  update(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: UpdateTemplateDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.templateService.update(id, data, user);
  }

  @Delete("bulk-communication-templates/:id")
  @ApiOperation({ summary: "Delete a template by id" })
  remove(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.templateService.remove(id);
  }

  @Get("patient-portal-templates")
  @ApiOperation({ summary: "Canned patient portal message templates" })
  patientPortalTemplates() {
    return this.templateService.patientPortalTemplates();
  }
}
