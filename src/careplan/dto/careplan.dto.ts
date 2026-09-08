import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

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
