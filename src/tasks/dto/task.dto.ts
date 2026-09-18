import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { ToBoolean } from "../../common/transforms";

export class RecurringDataDto {
  @ApiProperty({ enum: ["daily", "weekly", "monthly", "custom"] })
  @IsIn(["daily", "weekly", "monthly", "custom"])
  recurringFrequency: "daily" | "weekly" | "monthly" | "custom";

  @ApiPropertyOptional({
    description: "`on_date` runs through endDate; anything else uses endAfter",
    example: "after",
  })
  @IsOptional()
  @IsString()
  endType?: string;

  @ApiPropertyOptional({ example: "2026-12-31" })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: "Total number of tasks", example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  endAfter?: number;

  @ApiPropertyOptional({
    description: "Custom only: repeat every N",
    example: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  customFrequency?: number;

  @ApiPropertyOptional({ enum: ["days", "weeks", "months"] })
  @IsOptional()
  @IsIn(["days", "weeks", "months"])
  customFrequencyUnit?: string;

  @ApiPropertyOptional({
    description: "Custom weekly only: ISO weekdays, Monday = 1",
    example: [1, 3, 5],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  selectedWeekdays?: number[];

  @ApiPropertyOptional({
    description: "Accepted and ignored; top-level due_on wins",
  })
  @IsOptional()
  @IsString()
  due_on?: string;
}

class TaskFieldsDto {
  @ApiProperty({ example: "Call patient about refill" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: "high" })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional({ example: "call" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  action?: string;

  @ApiPropertyOptional({ description: "Provider id", example: 1 })
  @IsOptional()
  @IsInt()
  assignee?: number;

  @ApiPropertyOptional({ example: "2026-09-20T10:00:00Z" })
  @IsOptional()
  @IsDateString()
  due_on?: string;

  @ApiPropertyOptional({ example: "" })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: "Provider group id", example: 1 })
  @IsOptional()
  @IsInt()
  provider_group?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  reminder_set?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  reminder_send_to_host?: boolean;

  @ApiPropertyOptional({ example: ["email"], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  reminder_mediums?: string[];

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(0)
  reminder_before_number?: number;

  @ApiPropertyOptional({ enum: ["minutes", "hours", "days"] })
  @IsOptional()
  @IsIn(["minutes", "hours", "days"])
  reminder_before_unit?: string;

  @ApiPropertyOptional({ type: RecurringDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecurringDataDto)
  recurring_data?: RecurringDataDto;

  @ApiPropertyOptional({ description: "Accepted and ignored; due_on is used" })
  @IsOptional()
  @IsString()
  schedule_at?: string;
}

export class CreateTaskDto extends TaskFieldsDto {
  @ApiPropertyOptional({ description: "Patient id", example: 1 })
  @IsOptional()
  @IsInt()
  patient?: number;
}

export class CreateMultipleTaskDto extends TaskFieldsDto {
  @ApiProperty({ description: "One task per patient", example: [1, 2] })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  patient: number[];
}

export class UpdateTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  due_on?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    description: "`completed` or `Done` resolves the task; `To Do` reopens it",
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  patient_note?: string;
}

export class ResolveTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: "Defaults to now" })
  @IsOptional()
  @IsDateString()
  completed_on?: string;
}

export class AssignTaskDto {
  @ApiProperty({ description: "Provider id", example: 2 })
  @IsInt()
  assignee: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  due_on?: string;
}

export class BatchTaskDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  task_ids: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: "Reassign only: provider id" })
  @IsOptional()
  @IsInt()
  assignee?: number;

  @ApiPropertyOptional({ description: "Resolve only; defaults to now" })
  @IsOptional()
  @IsDateString()
  completed_on?: string;

  @ApiPropertyOptional({ description: "Reassign only" })
  @IsOptional()
  @IsDateString()
  due_on?: string;

  @ApiPropertyOptional({
    description: "Accepted and ignored; the route decides the action",
  })
  @IsOptional()
  @IsIn(["resolve", "reassign"])
  action?: "resolve" | "reassign";
}

export class QueryTasksDto {
  @ApiPropertyOptional({ description: "Provider group id" })
  @IsOptional()
  @IsString()
  group_id?: string;

  @ApiPropertyOptional({ description: "Only tasks assigned to me" })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  my_tasks?: boolean;

  @ApiPropertyOptional({ description: "Only tasks linked to a patient" })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  patient_task?: boolean;

  @ApiPropertyOptional({ description: "Only tasks with no patient" })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  provider_task?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description:
      "due_on, created_at, updated_at, title, priority, status, patient_name, assignee_name, assign_by_name",
  })
  @IsOptional()
  @IsString()
  sort_by?: string;

  @ApiPropertyOptional({
    description: "`to do` (default) shows open tasks; `all` shows everything",
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.toLowerCase() : value,
  )
  @IsIn(["to do", "all"])
  tasks?: "to do" | "all";

  @ApiPropertyOptional({ enum: ["asc", "desc"] })
  @IsOptional()
  @IsEnum(["asc", "desc"])
  order_by?: "asc" | "desc";

  @ApiPropertyOptional({ example: "1" })
  @IsOptional()
  @IsString()
  page_no?: string;

  @ApiPropertyOptional({ example: "20" })
  @IsOptional()
  @IsString()
  page_size?: string;
}
