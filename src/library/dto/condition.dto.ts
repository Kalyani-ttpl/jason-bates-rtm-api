import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export const CONDITION_SORT_FIELDS = [
  "created_at",
  "updated_at",
  "title",
] as const;

export class CreateConditionDto {
  @ApiProperty({ example: "Acid Reflux (GERD)" })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  for_ccm?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  for_pcm?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  for_bhi?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  for_rpm?: boolean;

  @ApiPropertyOptional({ example: ["CCM", "RPM"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  programs?: string[];

  @ApiPropertyOptional({
    description: "ICD code ids to link to this condition",
    example: ["1", "2"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  icd_codes?: string[];
}

export class UpdateConditionDto extends PartialType(CreateConditionDto) {}

export class ConditionQuestionDto {
  @ApiProperty({ example: "How often do you experience heartburn?" })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: "single_choice" })
  @IsOptional()
  @IsString()
  question_type?: string;

  @ApiPropertyOptional({ example: "Daily,Weekly,Monthly" })
  @IsOptional()
  @IsString()
  choices?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additional_note?: string;
}

export class CreateConditionQuestionsDto {
  @ApiProperty({ type: [ConditionQuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionQuestionDto)
  questions: ConditionQuestionDto[];
}

export class UpdateConditionQuestionDto extends PartialType(
  ConditionQuestionDto,
) {}

export class CopyQuestionariesDto {
  @ApiProperty({
    description: "Condition id to copy the questionnaire from",
    example: "3",
  })
  @IsNotEmpty()
  @IsString()
  source_condition_id: string;
}

export class QueryConditionsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsString()
  page_no?: string;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsString()
  page_size?: string;

  @ApiPropertyOptional({ enum: ["asc", "desc"] })
  @IsOptional()
  @IsIn(["asc", "desc"])
  order_by?: "asc" | "desc";

  @ApiPropertyOptional({ enum: CONDITION_SORT_FIELDS })
  @IsOptional()
  @IsIn(CONDITION_SORT_FIELDS)
  sort_by?: (typeof CONDITION_SORT_FIELDS)[number];

  @ApiPropertyOptional({ description: "Matches title or description" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Filter by program flag",
    enum: ["ccm", "pcm", "bhi", "rpm"],
  })
  @IsOptional()
  @IsIn(["ccm", "pcm", "bhi", "rpm"])
  program?: "ccm" | "pcm" | "bhi" | "rpm";
}
