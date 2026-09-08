import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export const CPT_CODE_STATUSES = ["active", "inactive"] as const;

export const CPT_CODE_SORT_FIELDS = [
  "created_at",
  "updated_at",
  "description",
  "code",
  "category",
  "global_period",
  "status",
  "is_favorite",
] as const;

export class CreateCptCodeDto {
  @ApiProperty({ description: "CPT code", example: "20610" })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiPropertyOptional({
    description: "Description shown in listings",
    example: "Arthrocentesis, aspiration/injection, major joint",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "Category",
    example: "Surgical",
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: "Global period in days", example: 90 })
  @IsOptional()
  @IsInt()
  @Min(0)
  global_period?: number;

  @ApiPropertyOptional({ enum: CPT_CODE_STATUSES, default: "active" })
  @IsOptional()
  @IsIn(CPT_CODE_STATUSES)
  status?: (typeof CPT_CODE_STATUSES)[number];

  @ApiPropertyOptional({ description: "Starred in listings", default: false })
  @IsOptional()
  @IsBoolean()
  is_favorite?: boolean;
}

export class UpdateCptCodeDto extends PartialType(CreateCptCodeDto) {}

export class QueryCptHcpcsDto {
  @ApiPropertyOptional({ description: "Matches code or description" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ["cpt", "hcpcs"] })
  @IsOptional()
  @IsIn(["cpt", "hcpcs"])
  type?: "cpt" | "hcpcs";
}

export class QueryCptCodesDto {
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

  @ApiPropertyOptional({ enum: CPT_CODE_SORT_FIELDS })
  @IsOptional()
  @IsIn(CPT_CODE_SORT_FIELDS)
  sort_by?: (typeof CPT_CODE_SORT_FIELDS)[number];

  @ApiPropertyOptional({
    description: "Matches code, description or category",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "Category", example: "Surgical" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: CPT_CODE_STATUSES })
  @IsOptional()
  @IsIn(CPT_CODE_STATUSES)
  status?: (typeof CPT_CODE_STATUSES)[number];

  @ApiPropertyOptional({
    enum: ["true", "false"],
    description: "Filter on starred codes",
  })
  @IsOptional()
  @IsIn(["true", "false"])
  is_favorite?: "true" | "false";
}
