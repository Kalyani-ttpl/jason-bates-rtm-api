import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export const PROVIDER_GROUP_STATUSES = ["active", "inactive"] as const;

/**
 * Address payload keeps Zenara's field names; the service maps them onto the
 * `addresses` columns from `schema (2).prisma` (line1, postal_code, ...).
 */
export class AddressDto {
  @ApiPropertyOptional({ example: "1200 Market St" })
  @IsOptional()
  @IsString()
  address_line_1?: string;

  @ApiPropertyOptional({ example: "Suite 400" })
  @IsOptional()
  @IsString()
  address_line_2?: string;

  @ApiPropertyOptional({ example: "PA" })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: "19107" })
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiPropertyOptional({ example: "Philadelphia" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: "US" })
  @IsOptional()
  @IsString()
  country?: string;
}

export class CreateGroupDto {
  @ApiProperty({ example: "Jason RTM Group" })
  @IsNotEmpty()
  @IsString()
  group_name: string;

  @ApiPropertyOptional({ example: "group@jason-rtm.com" })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: "+12155551234" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: "+12155555678" })
  @IsOptional()
  @IsString()
  fax_id?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ["care_management_company", "cardiology"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  speciality?: string[];

  @ApiPropertyOptional({ example: "https://jason-rtm.com" })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: "Caller ID used for outbound calls" })
  @IsOptional()
  @IsString()
  caller_id?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  caller_id_verified?: boolean;

  @ApiProperty({ type: AddressDto })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  physical_address: AddressDto;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  billing_address?: AddressDto;

  @ApiPropertyOptional({ description: "Storage key of the group logo" })
  @IsOptional()
  @IsString()
  picture?: string;

  @ApiPropertyOptional({ example: "America/New_York" })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ enum: PROVIDER_GROUP_STATUSES, default: "active" })
  @IsOptional()
  @IsIn(PROVIDER_GROUP_STATUSES)
  status?: (typeof PROVIDER_GROUP_STATUSES)[number];
}

export const PROVIDER_GROUP_SORT_FIELDS = [
  "id",
  "group_name",
  "created_at",
  "updated_at",
] as const;

export class QueryGroupsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsString()
  page_no?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsString()
  page_size?: string;

  @ApiPropertyOptional({ enum: ["asc", "desc"] })
  @IsOptional()
  @IsIn(["asc", "desc"])
  order_by?: "asc" | "desc";

  @ApiPropertyOptional({ enum: PROVIDER_GROUP_SORT_FIELDS })
  @IsOptional()
  @IsIn(PROVIDER_GROUP_SORT_FIELDS)
  sort_by?: (typeof PROVIDER_GROUP_SORT_FIELDS)[number];

  @ApiPropertyOptional({ description: "Matches group name" })
  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * Zenara accepts its whole group payload here and deletes the non-column keys
 * before writing. This DTO lists only the columns instead, so the global
 * whitelist rejects anything else.
 */
export class UpdateGroupDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  group_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fax_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  group_npi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  speciality?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caller_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  caller_id_verified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  device_vender_base_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ enum: PROVIDER_GROUP_STATUSES })
  @IsOptional()
  @IsIn(PROVIDER_GROUP_STATUSES)
  status?: (typeof PROVIDER_GROUP_STATUSES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  system_email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  system_email_verified?: boolean;

  @ApiPropertyOptional({ description: "Storage key of the group logo" })
  @IsOptional()
  @IsString()
  picture?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  communication_logo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  consent_logo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  report_logo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  disable_patient_emails?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  disable_patient_notifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  disable_patient_sms?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  disable_patient_calls?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  disable_provider_emails?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  disable_provider_notifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  disable_provider_sms?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  disable_call_recording?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  show_revenue?: boolean;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  physical_address?: AddressDto;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  billing_address?: AddressDto;
}
