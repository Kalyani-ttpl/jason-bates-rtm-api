import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ParseBigIntPipe } from "../common/pipes/parse-bigint.pipe";
import { CareplanService } from "./careplan.service";
import {
  CreateCarePlanQuestionDto,
  UpdateCarePlanQuestionDto,
} from "./dto/careplan.dto";

/** Question routes sit outside the `careplans` prefix, as they do in Zenara. */
@ApiTags("Care Plans")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class CarePlanQuestionController {
  constructor(private readonly careplanService: CareplanService) {}

  @Post("careplan-conditions/:id/questions")
  @ApiOperation({ summary: "Add a question to a care plan" })
  create(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: CreateCarePlanQuestionDto,
  ) {
    return this.careplanService.createQuestion(id, data);
  }

  @Patch("careplan-questions/:id")
  @ApiOperation({ summary: "Update a care plan question by id" })
  update(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: UpdateCarePlanQuestionDto,
  ) {
    return this.careplanService.updateQuestion(id, data);
  }

  @Delete("careplan-questions/:id")
  @ApiOperation({ summary: "Delete a care plan question by id" })
  remove(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.careplanService.removeQuestion(id);
  }
}
