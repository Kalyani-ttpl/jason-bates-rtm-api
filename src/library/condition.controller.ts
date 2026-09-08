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
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ParseBigIntPipe } from "../common/pipes/parse-bigint.pipe";
import { ConditionService } from "./condition.service";
import {
  CopyQuestionariesDto,
  CreateConditionDto,
  CreateConditionQuestionsDto,
  QueryConditionsDto,
  UpdateConditionDto,
  UpdateConditionQuestionDto,
} from "./dto/condition.dto";

@ApiTags("Conditions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("library")
export class ConditionController {
  constructor(private readonly conditionService: ConditionService) {}

  @Post("careplan-conditions/icd-codes")
  @ApiOperation({ summary: "Create a condition and link ICD codes to it" })
  create(@Body() data: CreateConditionDto) {
    return this.conditionService.create(data);
  }

  @Get("careplan-conditions")
  @ApiOperation({ summary: "List conditions" })
  findAll(@Query() query: QueryConditionsDto) {
    return this.conditionService.findAll(query);
  }

  @Get("careplan-conditions/:id")
  @ApiOperation({ summary: "Get a condition by id" })
  findOne(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.conditionService.findOne(id);
  }

  @Patch("careplan-conditions/:id")
  @ApiOperation({ summary: "Update a condition by id" })
  update(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: UpdateConditionDto,
  ) {
    return this.conditionService.update(id, data);
  }

  @Delete("careplan-conditions/:id")
  @ApiOperation({ summary: "Delete a condition by id" })
  remove(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.conditionService.remove(id);
  }

  @Get("careplan-conditions/:id/icdcodes")
  @ApiOperation({ summary: "ICD codes linked to a condition" })
  findIcdCodes(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.conditionService.findIcdCodes(id);
  }

  @Post("careplan-conditions/:id/questionaries")
  @ApiOperation({ summary: "Add questions to a condition" })
  createQuestions(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: CreateConditionQuestionsDto,
  ) {
    return this.conditionService.createQuestions(id, data);
  }

  @Get("careplan-conditions/:id/questionaries")
  @ApiOperation({ summary: "List a condition's questions" })
  findQuestions(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.conditionService.findQuestions(id);
  }

  @Post("careplan-conditions/:id/copy-questionaries")
  @ApiOperation({ summary: "Copy questions from another condition" })
  copyQuestions(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: CopyQuestionariesDto,
  ) {
    return this.conditionService.copyQuestions(id, data);
  }

  @Patch("condition-questionaries/:conditionId/:questionId")
  @ApiOperation({ summary: "Update one question of a condition" })
  updateQuestion(
    @Param("conditionId", ParseBigIntPipe) conditionId: bigint,
    @Param("questionId", ParseBigIntPipe) questionId: bigint,
    @Body() data: UpdateConditionQuestionDto,
  ) {
    return this.conditionService.updateQuestion(conditionId, questionId, data);
  }

  @Delete("condition-questionaries/:conditionId/:questionId")
  @ApiOperation({ summary: "Delete one question of a condition" })
  removeQuestion(
    @Param("conditionId", ParseBigIntPipe) conditionId: bigint,
    @Param("questionId", ParseBigIntPipe) questionId: bigint,
  ) {
    return this.conditionService.removeQuestion(conditionId, questionId);
  }
}
