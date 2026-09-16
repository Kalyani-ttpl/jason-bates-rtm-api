import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CommonQuestionService } from "./common-question.service";
import { QueryCommonQuestionsDto } from "./dto/common-question.dto";

@ApiTags("Care Plans")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("common-question")
export class CommonQuestionController {
  constructor(private readonly commonQuestionService: CommonQuestionService) {}

  @Get()
  @ApiOperation({ summary: "List care plan common questions" })
  findAll(@Query() query: QueryCommonQuestionsDto) {
    return this.commonQuestionService.findAll(query);
  }
}
