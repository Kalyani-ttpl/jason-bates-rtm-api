import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../common/constants";
import { ParseBigIntPipe } from "../common/pipes/parse-bigint.pipe";
import { CareplanService } from "./careplan.service";
import {
  CheckCarePlanDto,
  CheckCarePlanResponseDto,
  CopyCarePlanDto,
  CreateCarePlanDto,
  QueryCarePlanQuestionsDto,
  QueryCarePlansDto,
  UpdateCarePlanDto,
} from "./dto/careplan.dto";

@ApiTags("Care Plans")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("careplans")
export class CareplanController {
  constructor(private readonly careplanService: CareplanService) {}

  @Post("check-careplan")
  @HttpCode(200)
  @ApiOperation({ summary: "Check whether a care plan title is already taken" })
  @ApiResponse({ status: 200, type: CheckCarePlanResponseDto })
  checkCarePlan(@Body() payload: CheckCarePlanDto) {
    return this.careplanService.checkCarePlan(payload);
  }

  @Post()
  @ApiOperation({ summary: "Create a care plan" })
  create(
    @Body() data: CreateCarePlanDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.careplanService.create(data, user);
  }

  @Get()
  @ApiOperation({ summary: "List care plans" })
  findAll(@Query() query: QueryCarePlansDto) {
    return this.careplanService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a care plan by id" })
  findOne(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.careplanService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a care plan by id" })
  update(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: UpdateCarePlanDto,
  ) {
    return this.careplanService.update(id, data);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a care plan by id" })
  remove(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.careplanService.remove(id);
  }

  @Post(":id/copy-careplan")
  @ApiOperation({ summary: "Create a copy of a care plan" })
  copy(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: CopyCarePlanDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.careplanService.copy(id, data, user);
  }

  @Get(":id/questions")
  @ApiOperation({ summary: "List the questions of a care plan" })
  findQuestions(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Query() query: QueryCarePlanQuestionsDto,
  ) {
    return this.careplanService.findQuestions(id, query);
  }
}
