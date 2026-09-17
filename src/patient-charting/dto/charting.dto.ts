import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

/** Shared by every charting tab: paginate, search, sort, hide soft-deleted. */
export class ChartingQueryDto {
  @ApiPropertyOptional({ example: "1" })
  @IsOptional()
  @IsString()
  page_no?: string;

  @ApiPropertyOptional({ example: "10" })
  @IsOptional()
  @IsString()
  page_size?: string;

  @ApiPropertyOptional({ enum: ["asc", "desc"] })
  @IsOptional()
  @IsEnum(["asc", "desc"])
  order_by?: "asc" | "desc";

  @ApiPropertyOptional({ example: "created_at" })
  @IsOptional()
  @IsString()
  sort_by?: string;

  @ApiPropertyOptional({ example: "Diabetes" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Defaults to false, so deleted rows are hidden",
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_deleted?: boolean;
}

export enum ChartingAction {
  Add = "add",
  Update = "update",
  Delete = "delete",
}

export class PatientConditionDto {
  @ApiPropertyOptional({
    description: "Existing patient condition id, for update and delete",
    example: 1,
  })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiPropertyOptional({ description: "Condition library id", example: 1 })
  @IsOptional()
  @IsInt()
  condition?: number;

  @ApiPropertyOptional({ example: "active" })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: "chronic" })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: "2026-01-15" })
  @IsOptional()
  @IsDateString()
  onset_date?: string;

  @ApiPropertyOptional({ example: "2026-02-01" })
  @IsOptional()
  @IsDateString()
  last_occurence?: string;

  @ApiPropertyOptional({ example: "" })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_complex?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_source_ehr?: boolean;

  @ApiPropertyOptional({
    description: "Display label echoed by the form. Accepted and ignored.",
  })
  @IsOptional()
  @IsString()
  condition_title?: string;

  @ApiProperty({ enum: ChartingAction, example: ChartingAction.Add })
  @IsEnum(ChartingAction)
  action: ChartingAction;
}

export class CreateSymptomDto {
  @ApiPropertyOptional({ description: "Existing symptom id, to update" })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty({ example: "Shortness of breath on exertion" })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: "" })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateAllergyDto {
  @ApiPropertyOptional({ description: "Existing allergy id, to update" })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty({ example: "Penicillin" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: "Rash" })
  @IsOptional()
  @IsString()
  reaction?: string;

  @ApiPropertyOptional({ example: "moderate" })
  @IsOptional()
  @IsString()
  severity?: string;

  @ApiPropertyOptional({ example: "high" })
  @IsOptional()
  @IsString()
  criticality?: string;

  @ApiPropertyOptional({ example: "2020-05-01" })
  @IsOptional()
  @IsDateString()
  onset_date?: string;

  @ApiPropertyOptional({ example: "" })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_source_ehr?: boolean;
}

export class CreateMedicationDto {
  @ApiPropertyOptional({ description: "Existing medication id, to update" })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty({ description: "Medicine name", example: "Metformin" })
  @IsNotEmpty()
  @IsString()
  medicine: string;

  @ApiPropertyOptional({ example: "active" })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: "500mg twice daily" })
  @IsOptional()
  @IsString()
  sig?: string;

  @ApiPropertyOptional({ example: "mg" })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: "When taken", example: "after_meal" })
  @IsOptional()
  @IsString()
  when?: string;

  @ApiPropertyOptional({ example: "oral" })
  @IsOptional()
  @IsString()
  route?: string;

  @ApiPropertyOptional({ example: "twice daily" })
  @IsOptional()
  @IsString()
  frequency?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  days?: number;

  @ApiPropertyOptional({ example: "2026-01-15" })
  @IsOptional()
  @IsDateString()
  start_at?: string;

  @ApiPropertyOptional({ example: "2026-03-15" })
  @IsOptional()
  @IsDateString()
  end_at?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  for_lifetime?: boolean;

  @ApiPropertyOptional({ example: "" })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_source_ehr?: boolean;
}

export class CreateLabResultDto {
  @ApiPropertyOptional({ description: "Existing lab result id, to update" })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty({ description: "Test name", example: "HbA1c" })
  @IsNotEmpty()
  @IsString()
  lab_result_for: string;

  @ApiProperty({ example: "7.2%" })
  @IsNotEmpty()
  @IsString()
  value: string;

  @ApiPropertyOptional({ example: "high" })
  @IsOptional()
  @IsString()
  abnormal_flag?: string;

  @ApiPropertyOptional({ example: "2026-02-01T00:00:00Z" })
  @IsOptional()
  @IsDateString()
  recorded_at?: string;

  @ApiPropertyOptional({ example: "" })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    description: "Storage key or URL of an already uploaded report",
  })
  @IsOptional()
  @IsString()
  file?: string;

  @ApiPropertyOptional({ example: "pdf" })
  @IsOptional()
  @IsString()
  file_type?: string;

  @ApiPropertyOptional({
    description: "Storage keys or URLs of extra report files",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additional_files?: string[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_track?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_draft?: boolean;
}
