import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateEducationDto {
  @ApiProperty({ example: "Managing blood pressure at home" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: ["cardiology"], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialities?: string[];

  @ApiPropertyOptional({ description: "Condition ids", example: [3, 2] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  conditions?: number[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description:
      "Base64 data URL (`data:application/pdf;base64,...`) or a storage key",
  })
  @IsOptional()
  @IsString()
  file?: string;

  @ApiPropertyOptional({ example: ["patient"], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  user_types?: string[];

  @ApiPropertyOptional({ description: "Provider group id", example: 1 })
  @IsOptional()
  provider_group?: number | string;
}

/** Query for both the material list and one patient's assigned materials. */
export class QueryEducationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  group_id?: string;

  @ApiPropertyOptional({ description: "Search on title" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Comma-separated",
    example: "cardiology",
  })
  @IsOptional()
  @IsString()
  speciality?: string;

  @ApiPropertyOptional({ description: "Comma-separated", example: "patient" })
  @IsOptional()
  @IsString()
  user_types?: string;

  @ApiPropertyOptional({
    description: "Comma-separated condition ids",
    example: "3,2",
  })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({ enum: ["title", "created_at"] })
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

  @ApiPropertyOptional({
    description: "`true` lists archived materials instead",
  })
  @IsOptional()
  @IsString()
  is_archived?: string;

  @ApiPropertyOptional({ description: "Accepted and ignored" })
  @IsOptional()
  @IsString()
  assigned_by?: string;

  @ApiPropertyOptional({ description: "Accepted and ignored" })
  @IsOptional()
  @IsString()
  responsible_person?: string;
}

export class AssignEducationDto {
  @ApiProperty({ description: "Patient ids", example: [1, 2] })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  patient: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class QueryAssignedPatientsDto {
  @ApiPropertyOptional({ example: "1" })
  @IsOptional()
  @IsString()
  page_no?: string;

  @ApiPropertyOptional({ example: "10" })
  @IsOptional()
  @IsString()
  page_size?: string;

  @ApiPropertyOptional({ enum: ["created_at", "note"] })
  @IsOptional()
  @IsString()
  sort_by?: string;

  @ApiPropertyOptional({ enum: ["asc", "desc"] })
  @IsOptional()
  @IsEnum(["asc", "desc"])
  order_by?: "asc" | "desc";
}

export class ScheduleEducationDto {
  @ApiProperty({ description: "Patient ids", example: [1, 2] })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  patients: number[];

  @ApiProperty({ description: "Provider id sending it", example: 1 })
  @IsInt()
  send_by: number;

  @ApiProperty({ example: "2026-09-20T10:00:00Z" })
  @IsDateString()
  send_at: string;

  @ApiPropertyOptional({
    description: "Accepted and ignored; Zenara stores no note",
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: "Accepted and ignored; use `patients`" })
  @IsOptional()
  @IsInt()
  patient?: number;
}

export class UpdateScheduleDto {
  @ApiProperty({ example: "2026-09-21T10:00:00Z" })
  @IsDateString()
  send_at: string;

  @ApiPropertyOptional({ description: "Accepted and ignored" })
  @IsOptional()
  send_by?: number;

  @ApiPropertyOptional({ description: "Accepted and ignored" })
  @IsOptional()
  patient?: number;

  @ApiPropertyOptional({ description: "Accepted and ignored" })
  @IsOptional()
  @IsArray()
  patients?: number[];
}

export class CancelScheduleDto {
  @ApiPropertyOptional({
    description: "Accepted and ignored; the whole schedule is cancelled",
  })
  @IsOptional()
  @IsInt()
  patient?: number;
}

export class QuerySchedulesDto {
  @ApiPropertyOptional({ example: "1" })
  @IsOptional()
  @IsString()
  page_no?: string;

  @ApiPropertyOptional({ example: "10" })
  @IsOptional()
  @IsString()
  page_size?: string;

  @ApiPropertyOptional({ enum: ["schedule", "cancel", "sent"] })
  @IsOptional()
  @IsString()
  schedule_status?: string;

  @ApiPropertyOptional({ enum: ["title_asc", "title_desc"] })
  @IsOptional()
  @IsString()
  sort_by?: string;
}
