import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { QType } from "../../common/constants";

export class CheckCarePlanDto {
  @ApiProperty({ example: "Test Care Plan", maxLength: 200 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200, { message: "Name must be at most 200 characters long" })
  title: string;

  @ApiPropertyOptional({ example: "ccm" })
  @IsOptional()
  @IsString()
  program?: string;

  @ApiPropertyOptional({
    description: "Care plan being edited, excluded from the duplicate check",
    example: "1",
  })
  @IsOptional()
  @IsString()
  id?: string;
}

export class CheckCarePlanResponseDto {
  @ApiProperty({ example: "Care Plan with this name does not exist" })
  @IsString()
  message: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isExist: boolean;
}

export class QuestionDto {
  @ApiPropertyOptional({
    description:
      "Id of the common question this was copied from. Accepted and ignored.",
    example: 14,
  })
  @IsOptional()
  id?: number;

  @ApiPropertyOptional({
    description: "Accepted and ignored; the care plan comes from the path.",
    example: 0,
  })
  @IsOptional()
  careplan?: number;

  @ApiProperty({ example: "How are you feeling today?" })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: "" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "Defaults to the section name when omitted",
    example: "goals",
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: "free_text" })
  @IsString()
  question_type: string;

  @ApiPropertyOptional({ example: ["Yes", "No"], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  choices?: string[];
}

export class SectionDto {
  @ApiProperty({ example: "goals" })
  @IsString()
  section_name: string;

  @ApiProperty({ type: [QuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}

export class CarePlanTaskDto {
  @ApiPropertyOptional({ example: "Follow-up call", maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: "CALL", maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  action?: string;

  @ApiPropertyOptional({ example: "HIGH", maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  priority?: string;

  @ApiProperty({ example: 123 })
  @IsNumber()
  template_id: number;
}

export class CreateCarePlanDto {
  @ApiProperty({ example: "Test Care Plan", maxLength: 200 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200, { message: "Name must be at most 200 characters long" })
  title: string;

  @ApiPropertyOptional({ example: "" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  support?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  allergies?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  medications?: boolean;

  @ApiPropertyOptional({ example: [3], type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  conditions?: number[];

  @ApiPropertyOptional({
    description:
      "Display label for the chosen condition. Accepted and ignored.",
    example: "Acid Reflux (GERD)",
  })
  @IsOptional()
  @IsString()
  carePlanConditionLabel?: string;

  @ApiPropertyOptional({ example: ["97588"], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  icd_codes?: string[];

  @ApiPropertyOptional({ example: ["ccm"], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  programs?: string[];

  @ApiPropertyOptional({ example: "1" })
  @IsOptional()
  @IsString()
  provider_group?: string;

  @ApiPropertyOptional({ type: [SectionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections?: SectionDto[];

  @ApiPropertyOptional({ type: [CarePlanTaskDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarePlanTaskDto)
  task?: CarePlanTaskDto[];
}

export class UpdateCarePlanDto extends CreateCarePlanDto {
  @ApiPropertyOptional({ example: "Updated Care Plan Title", maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: "Name must be at most 200 characters long" })
  declare title: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class QueryCarePlansDto {
  @ApiPropertyOptional({ description: "Filter by condition title" })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({ description: "Filter by creator first/last name" })
  @IsOptional()
  @IsString()
  creator_name?: string;

  @ApiPropertyOptional({ description: "Filter by provider group id" })
  @IsOptional()
  @IsString()
  group_id?: string;

  @ApiPropertyOptional({ description: "Filter by program, e.g. ccm" })
  @IsOptional()
  @IsString()
  program?: string;

  @ApiPropertyOptional({ description: "Search on title" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: "created_at" })
  @IsOptional()
  @IsString()
  sort_by?: string;

  @ApiPropertyOptional({ enum: ["asc", "desc"] })
  @IsOptional()
  @IsEnum(["asc", "desc"])
  order_by?: "asc" | "desc";

  @ApiPropertyOptional({ example: "1" })
  @IsOptional()
  @IsString()
  page_no?: string;

  @ApiPropertyOptional({ example: "10" })
  @IsOptional()
  @IsString()
  page_size?: string;
}

export class QueryCarePlanQuestionsDto {
  @ApiPropertyOptional({ enum: QType, example: QType.Goals })
  @IsOptional()
  @IsString()
  type?: string;
}

export class CreateCarePlanQuestionDto {
  @ApiProperty({ example: "How are you feeling today?" })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: "" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: "goals" })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: "free_text" })
  @IsOptional()
  @IsString()
  question_type?: string;

  @ApiPropertyOptional({ example: ["Yes", "No"], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  choices?: string[];

  @ApiPropertyOptional({
    description: "Care plan to attach to, overriding the id in the path",
    example: "1",
  })
  @IsOptional()
  @IsString()
  careplan?: string;
}

export class UpdateCarePlanQuestionDto extends CreateCarePlanQuestionDto {
  @ApiPropertyOptional({ example: "How are you feeling today?" })
  @IsOptional()
  @IsString()
  declare title: string;

  @ApiPropertyOptional({ example: "1" })
  @IsOptional()
  @IsString()
  careplan_id?: string;
}

export class CopyCarePlanDto {
  @ApiProperty({ example: "Copy of Test Care Plan", maxLength: 200 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200, { message: "Name must be at most 200 characters long" })
  title: string;
}
