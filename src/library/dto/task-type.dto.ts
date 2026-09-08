import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export const TASK_TYPE_SORT_FIELDS = [
  "created_at",
  "updated_at",
  "title",
] as const;

export class CreateTaskTypeDto {
  @ApiProperty({ example: "Follow-up Appointment" })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_billable?: boolean;

  @ApiPropertyOptional({ description: "Provider group id", example: "1" })
  @IsOptional()
  @IsString()
  provider_group_id?: string;
}

export class UpdateTaskTypeDto extends PartialType(CreateTaskTypeDto) {
  @ApiPropertyOptional({ description: "Archive or restore the activity type" })
  @IsOptional()
  @IsBoolean()
  is_archived?: boolean;
}

export class QueryTaskTypesDto {
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

  @ApiPropertyOptional({ enum: TASK_TYPE_SORT_FIELDS })
  @IsOptional()
  @IsIn(TASK_TYPE_SORT_FIELDS)
  sort_by?: (typeof TASK_TYPE_SORT_FIELDS)[number];

  @ApiPropertyOptional({ description: "Matches title" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ["true", "false"],
    description: "Archive filter",
  })
  @IsOptional()
  @IsIn(["true", "false"])
  is_archived?: "true" | "false";

  @ApiPropertyOptional({ example: "1" })
  @IsOptional()
  @IsString()
  provider_group_id?: string;
}
