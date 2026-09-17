import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../common/constants";
import { ParseBigIntPipe } from "../common/pipes/parse-bigint.pipe";
import { AssessmentsService } from "./assessments.service";
import {
  CopyAssessmentDto,
  CreateAssessmentDto,
  QueryAssessmentsDto,
  UpdateAssessmentDto,
} from "./dto/assessment.dto";

@ApiTags("Assessments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("assessments")
export class AssessmentsController {
  constructor(private readonly assessments: AssessmentsService) {}

  @Post()
  @ApiOperation({ summary: "Create an assessment" })
  create(
    @Body() data: CreateAssessmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.assessments.create(data, user);
  }

  @Get()
  @ApiOperation({ summary: "List assessments" })
  findAll(@Query() query: QueryAssessmentsDto) {
    return this.assessments.findAll(query);
  }

  @Get(":id/questions")
  @ApiOperation({ summary: "Get an assessment's question tree" })
  findQuestions(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.assessments.findQuestions(id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an assessment by id" })
  findOne(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.assessments.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an assessment by id" })
  update(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: UpdateAssessmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.assessments.update(id, data, user);
  }

  @Post(":id/update-assessment")
  @ApiOperation({ summary: "Update an assessment by id (POST alias)" })
  updateViaPost(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: UpdateAssessmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.assessments.update(id, data, user);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Archive an assessment by id" })
  remove(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.assessments.remove(id);
  }

  @Post(":id/copy-assessment")
  @ApiOperation({ summary: "Create a copy of an assessment" })
  copy(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: CopyAssessmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.assessments.copy(id, data, user);
  }
}
