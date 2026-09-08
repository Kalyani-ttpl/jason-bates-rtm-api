import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export const PROVIDER_STATUSES = ["active", "inactive", "invited"] as const;

export class CreateProviderDto {
  @ApiProperty({ example: "jane.doe@jason-rtm.com" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: "Jane" })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({ example: "Doe" })
  @IsNotEmpty()
  @IsString()
  last_name: string;

  /**
   * Zenara leaves the password unset and emails an invitation link instead. No
   * mail service is configured here, so a password supplied at creation lets
   * the provider sign in straight away; omit it to match Zenara's behaviour.
   */
  @ApiPropertyOptional({
    example: "Provider@123",
    description:
      "Sets the sign-in password. Omit to create the account without one, " +
      "as Zenara does when it sends an invitation email.",
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({ example: "active" })
  @IsOptional()
  @IsIn(PROVIDER_STATUSES)
  status?: (typeof PROVIDER_STATUSES)[number];

  @ApiPropertyOptional({
    description: "Provider group ids to add this provider to",
    example: ["1"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  provider_group?: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_tenant_admin?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_clinical_manager?: boolean;

  @ApiPropertyOptional({ example: "1234567890" })
  @IsOptional()
  @IsString()
  npi?: string;

  @ApiPropertyOptional({ example: "physician" })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secondary_role?: string;

  @ApiPropertyOptional({ example: "Dr. Jane Doe" })
  @IsOptional()
  @IsString()
  display_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  middle_name?: string;

  @ApiPropertyOptional({ example: "+12155551234" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pronoun?: string;

  @ApiPropertyOptional({ example: ["cardiology"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  speciality?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  provider_type?: string;

  @ApiPropertyOptional({ example: "10" })
  @IsOptional()
  @IsString()
  year_of_experience?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: "PA" })
  @IsOptional()
  @IsString()
  state_license?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  license_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  taxonomyCode?: string;

  @ApiPropertyOptional({ example: "en" })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: "America/New_York" })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: "Storage key of the provider photo" })
  @IsOptional()
  @IsString()
  picture?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_auto_timelog?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  auto_timelog_message?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caller_id?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  caller_id_verified?: boolean;

  @ApiPropertyOptional({
    description: "Per-group caller ids, keyed by provider group id",
  })
  @IsOptional()
  @IsObject()
  dynamic_caller_ids?: Record<
    string,
    { caller_id: string; caller_id_verified: boolean }
  >;
}
