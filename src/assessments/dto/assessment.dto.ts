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

/**
 * A choice can branch into further questions, which can branch again, so the
 * two DTOs reference each other. `__pseudoId` is the form's own row key —
 * accepted and ignored, since the global pipe rejects unknown fields.
 */
export class AssessmentChoiceDto {
  @ApiProperty({ example: "test a" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_free_text?: boolean;

  @ApiPropertyOptional({ example: "c1" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  nas_class?: string;

  @ApiPropertyOptional({
    type: () => [AssessmentQuestionDto],
    description: "Questions shown when this choice is picked",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssessmentQuestionDto)
  questions?: AssessmentQuestionDto[];

  @ApiPropertyOptional({ description: "Form row key. Accepted and ignored." })
  @IsOptional()
  @IsNumber()
  __pseudoId?: number;
}

export class AssessmentQuestionDto {
  @ApiProperty({ example: "At perspiciatis ea" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: "" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: "free_text" })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiPropertyOptional({ type: () => [AssessmentChoiceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssessmentChoiceDto)
  choices?: AssessmentChoiceDto[];

  @ApiPropertyOptional({ description: "Form row key. Accepted and ignored." })
  @IsOptional()
  @IsNumber()
  __pseudoId?: number;
}

export class CreateAssessmentDto {
  @ApiProperty({ example: "Depression screening", maxLength: 255 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: "" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: "formative" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({ example: [3, 2], type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  conditions?: number[];

  @ApiPropertyOptional({ example: "monthly" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  frequencey?: string;

  @ApiPropertyOptional({ example: "high" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  flag?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_nas_assessment?: boolean;

  @ApiPropertyOptional({ example: "1" })
  @IsOptional()
  @IsString()
  group_id?: string;

  @ApiPropertyOptional({ type: [AssessmentQuestionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssessmentQuestionDto)
  assessment_questions?: AssessmentQuestionDto[];
}

export class UpdateAssessmentDto extends CreateAssessmentDto {
  @ApiPropertyOptional({ example: "Depression screening", maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  declare title: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_archieved?: boolean;
}

export class CopyAssessmentDto {
  @ApiProperty({ example: "Depression screening", maxLength: 255 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;
}

export class QueryAssessmentsDto {
  @ApiPropertyOptional({ description: "Search on title and description" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "Filter by creator first/last name" })
  @IsOptional()
  @IsString()
  creator_name?: string;

  @ApiPropertyOptional({ description: "Filter by condition title" })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({ description: "Filter by provider group id" })
  @IsOptional()
  @IsString()
  group_id?: string;

  @ApiPropertyOptional({ description: "Filter by category" })
  @IsOptional()
  @IsString()
  category?: string;

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

  @ApiPropertyOptional({ example: "15" })
  @IsOptional()
  @IsString()
  page_size?: string;
}
