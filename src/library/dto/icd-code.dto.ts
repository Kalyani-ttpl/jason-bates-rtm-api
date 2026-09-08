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

export const ICD_CODE_STATUSES = ["active", "inactive"] as const;

export const ICD_CODE_SORT_FIELDS = [
  "created_at",
  "updated_at",
  "description",
  "code",
  "status",
  "order_number",
] as const;

export class CreateIcdCodeDto {
  @ApiProperty({ description: "ICD-10 code", example: "M17.11" })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiPropertyOptional({
    description: "Description shown in listings",
    example: "Unilateral primary osteoarthritis, right knee",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ICD_CODE_STATUSES, default: "active" })
  @IsOptional()
  @IsIn(ICD_CODE_STATUSES)
  status?: (typeof ICD_CODE_STATUSES)[number];

  @ApiPropertyOptional({
    description: "Excluded from ICD-10 pickers when true",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_unspecified?: boolean;

  @ApiPropertyOptional({ example: "1" })
  @IsOptional()
  @IsString()
  is_hipaa_covered?: string;

  @ApiPropertyOptional({ example: "00001" })
  @IsOptional()
  @IsString()
  order_number?: string;
}

export class UpdateIcdCodeDto extends PartialType(CreateIcdCodeDto) {}

export class UploadIcdCodesDto {
  @ApiProperty({ type: [CreateIcdCodeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIcdCodeDto)
  codes: CreateIcdCodeDto[];
}

export class QueryIcdCodesDto {
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

  @ApiPropertyOptional({ enum: ICD_CODE_SORT_FIELDS })
  @IsOptional()
  @IsIn(ICD_CODE_SORT_FIELDS)
  sort_by?: (typeof ICD_CODE_SORT_FIELDS)[number];

  @ApiPropertyOptional({ description: "Matches code or description" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ICD_CODE_STATUSES })
  @IsOptional()
  @IsIn(ICD_CODE_STATUSES)
  status?: (typeof ICD_CODE_STATUSES)[number];

  @ApiPropertyOptional({
    enum: ["true", "false"],
    description: "Filter on the unspecified flag",
  })
  @IsOptional()
  @IsIn(["true", "false"])
  is_unspecified?: "true" | "false";
}
