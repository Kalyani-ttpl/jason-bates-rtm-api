import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ParseBigIntPipe } from "../common/pipes/parse-bigint.pipe";
import {
  CreateGroupDto,
  QueryGroupsDto,
  UpdateGroupDto,
} from "./dto/providergroup.dto";
import { ProvidergroupService } from "./providergroup.service";

@ApiTags("Provider Groups")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("provider-groups")
export class ProvidergroupController {
  constructor(private readonly providergroupService: ProvidergroupService) {}

  @Post()
  @ApiOperation({ summary: "Create a new provider group" })
  @ApiResponse({ status: 201, description: "Provider group created." })
  @ApiResponse({ status: 409, description: "Group name already exists." })
  createProviderGroup(@Body() createGroupDto: CreateGroupDto) {
    return this.providergroupService.createProviderGroup(createGroupDto);
  }

  @Get()
  @ApiOperation({
    summary: "List provider groups with pagination, search and sort",
  })
  getProviderGroup(@Query() query: QueryGroupsDto) {
    return this.providergroupService.getProviderGroup(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a provider group by id" })
  @ApiResponse({ status: 404, description: "Provider group not found." })
  getProviderGroupById(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.providergroupService.getProviderGroupById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a provider group by id" })
  @ApiResponse({ status: 404, description: "Provider group not found." })
  updateProviderGroup(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.providergroupService.updateProviderGroup(id, updateGroupDto);
  }
}
