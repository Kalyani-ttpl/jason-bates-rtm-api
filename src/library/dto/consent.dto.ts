import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export const CONSENT_SORT_FIELDS = [
  "created_at",
  "updated_at",
  "title",
  "program",
] as const;

export class CreateConsentDto {
  @ApiProperty({ example: "CCM Enrollment Consent" })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: "CCM" })
  @IsOptional()
  @IsString()
  program?: string;

  @ApiPropertyOptional({
    description: "Consent body or storage key of the uploaded document",
  })
  @IsOptional()
  @IsString()
  file?: string;
}

export class UpdateConsentDto extends PartialType(CreateConsentDto) {}

export class CopyConsentDto {
  @ApiProperty({ example: "CCM Enrollment Consent (copy)" })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: "CCM" })
  @IsOptional()
  @IsString()
  program?: string;
}

export class QueryConsentsDto {
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

  @ApiPropertyOptional({ enum: CONSENT_SORT_FIELDS })
  @IsOptional()
  @IsIn(CONSENT_SORT_FIELDS)
  sort_by?: (typeof CONSENT_SORT_FIELDS)[number];

  @ApiPropertyOptional({ description: "Matches title" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: "CCM" })
  @IsOptional()
  @IsString()
  program?: string;
}
