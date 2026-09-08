import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export const TEMPLATE_TYPES = ["sms", "email", "voice"] as const;

export const TEMPLATE_SORT_FIELDS = [
  "created_at",
  "updated_at",
  "title",
  "template_type",
] as const;

export class CreateTemplateDto {
  @ApiProperty({ example: "Appointment reminder" })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: "Your appointment is tomorrow" })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: "Hi {{patient_name}}, this is a reminder..." })
  @IsNotEmpty()
  @IsString()
  template_body: string;

  @ApiProperty({ enum: TEMPLATE_TYPES })
  @IsNotEmpty()
  @IsIn(TEMPLATE_TYPES)
  template_type: (typeof TEMPLATE_TYPES)[number];

  @ApiPropertyOptional({ example: "1" })
  @IsOptional()
  @IsString()
  provider_group_id?: string;
}

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {
  @ApiPropertyOptional({ description: "Archive the template" })
  @IsOptional()
  @IsBoolean()
  achieved?: boolean;
}

export class QueryTemplatesDto {
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

  @ApiPropertyOptional({ enum: TEMPLATE_SORT_FIELDS })
  @IsOptional()
  @IsIn(TEMPLATE_SORT_FIELDS)
  sort_by?: (typeof TEMPLATE_SORT_FIELDS)[number];

  @ApiPropertyOptional({ description: "Matches title, subject or body" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: TEMPLATE_TYPES })
  @IsOptional()
  @IsIn(TEMPLATE_TYPES)
  template_type?: (typeof TEMPLATE_TYPES)[number];

  @ApiPropertyOptional({
    enum: ["true", "false"],
    description: "Archive filter",
  })
  @IsOptional()
  @IsIn(["true", "false"])
  achieved?: "true" | "false";

  @ApiPropertyOptional({ example: "1" })
  @IsOptional()
  @IsString()
  provider_group_id?: string;
}
