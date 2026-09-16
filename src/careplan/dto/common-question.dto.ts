import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { QType } from "../../common/constants";

export class QueryCommonQuestionsDto {
  @ApiPropertyOptional({
    description: "Question type. Omit to list every common question.",
    enum: QType,
    example: QType.GeneralQuestions,
  })
  @IsOptional()
  @IsString()
  type?: string;
}
