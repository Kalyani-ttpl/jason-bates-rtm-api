import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class DuplicatePatientCheckDto {
  @ApiProperty({ example: "Isidro" })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({ example: "McGlynn" })
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiProperty({ example: "1959-01-01" })
  @IsNotEmpty()
  @IsDateString()
  date_of_birth: string;
}

export class AddressDto {
  @ApiPropertyOptional({ example: "12 Main St" })
  @IsOptional()
  @IsString()
  address_line_1?: string;

  @ApiPropertyOptional({ example: "Apt 4" })
  @IsOptional()
  @IsString()
  address_line_2?: string;

  @ApiPropertyOptional({ example: "Boston" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: "MA" })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: "02108" })
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiPropertyOptional({ example: "USA" })
  @IsOptional()
  @IsString()
  country?: string;
}

export class DemographyDto {
  @ApiProperty({ example: "Isidro" })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiPropertyOptional({ example: "J" })
  @IsOptional()
  @IsString()
  middle_name?: string;

  @ApiProperty({ example: "McGlynn" })
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiPropertyOptional({ example: "Male" })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: "he/him" })
  @IsOptional()
  @IsString()
  pronoun?: string;

  @ApiProperty({ example: "1959-01-01" })
  @IsNotEmpty()
  @IsDateString()
  date_of_birth: string;

  @ApiPropertyOptional({ example: "patient@example.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: "9876543210" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: "9876543211" })
  @IsOptional()
  @IsString()
  secondary_phone?: string;

  @ApiPropertyOptional({ example: "9876543212" })
  @IsOptional()
  @IsString()
  home_phone?: string;

  @ApiPropertyOptional({ example: "9876543213" })
  @IsOptional()
  @IsString()
  work_phone?: string;

  @ApiPropertyOptional({ example: "en" })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: "White" })
  @IsOptional()
  @IsString()
  race?: string;

  @ApiPropertyOptional({ example: "Not Hispanic or Latino" })
  @IsOptional()
  @IsString()
  ethnicity?: string;

  @ApiPropertyOptional({ example: "Married" })
  @IsOptional()
  @IsString()
  marital_status?: string;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional({ example: "11" })
  @IsOptional()
  @IsString()
  pos?: string;

  @ApiPropertyOptional({ example: "high" })
  @IsOptional()
  @IsString()
  risk_level?: string;

  @ApiPropertyOptional({ example: 2.4 })
  @IsOptional()
  @IsNumber()
  risk_score?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_consent_to_message?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_consent_to_call?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_consent_to_email?: boolean;

  @ApiPropertyOptional({ example: "Prefers morning calls" })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: "2026-01-15" })
  @IsOptional()
  @IsDateString()
  registration_date?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_pcm_eligible?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_rtm_eligible?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_heart_eligible?: boolean;

  @ApiPropertyOptional({ description: "Provider id", example: 1 })
  @IsOptional()
  @IsNumber()
  primary_care_manager?: number;

  @ApiPropertyOptional({ description: "Provider id", example: 2 })
  @IsOptional()
  @IsNumber()
  secondary_care_manager?: number;

  @ApiPropertyOptional({ description: "Provider id", example: 3 })
  @IsOptional()
  @IsNumber()
  primary_physician?: number;

  @ApiPropertyOptional({ example: "Dr. Smith" })
  @IsOptional()
  @IsString()
  referring_provider?: string;

  @ApiPropertyOptional({ example: "sms" })
  @IsOptional()
  @IsString()
  preferred_communication_channel?: string;

  @ApiPropertyOptional({ example: "America/New_York" })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  disable_call_recording?: boolean;

  @ApiPropertyOptional({ description: "Provider group id", example: 1 })
  @IsOptional()
  @IsNumber()
  provider_group?: number;

  @ApiPropertyOptional({ example: "MRN-00123" })
  @IsOptional()
  @IsString()
  mrn?: string;

  @ApiPropertyOptional({
    description: "Storage key or URL of an already uploaded picture",
  })
  @IsOptional()
  @IsString()
  picture?: string;
}

export class EnrollmentDto {
  @ApiProperty({ example: "rtm" })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: "2026-01-15T00:00:00Z" })
  @IsOptional()
  @IsDateString()
  enrolled_at?: string;

  @ApiPropertyOptional({ example: "verbal_consent" })
  @IsOptional()
  @IsString()
  consent_form_type?: string;

  @ApiPropertyOptional({
    description: "Storage key or URL of an already uploaded consent file",
  })
  @IsOptional()
  @IsString()
  signed_consent_file?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_billable?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_declined?: boolean;

  @ApiPropertyOptional({ example: "2026-01-15T00:00:00Z" })
  @IsOptional()
  @IsDateString()
  declined_at?: string;

  @ApiPropertyOptional({ example: "Patient asked to be called back" })
  @IsOptional()
  @IsString()
  note?: string;
}

export class EmergencyContactDto {
  @ApiProperty({ example: "Jane Doe" })
  @IsNotEmpty()
  @IsString()
  contact_person: string;

  @ApiPropertyOptional({ example: "9876543210" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: "Spouse" })
  @IsOptional()
  @IsString()
  relation?: string;

  @ApiPropertyOptional({ example: "jane@example.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: "en" })
  @IsOptional()
  @IsString()
  preferred_language?: string;
}

export class InsuranceDto {
  @ApiProperty({ example: "Blue Cross" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: "primary" })
  @IsOptional()
  @IsString()
  insurance_type?: string;

  @ApiPropertyOptional({ example: "John McGlynn" })
  @IsOptional()
  @IsString()
  holder_name?: string;

  @ApiPropertyOptional({ example: "POL-123456" })
  @IsOptional()
  @IsString()
  policy_number?: string;

  @ApiPropertyOptional({ example: "GRP-987" })
  @IsOptional()
  @IsString()
  group_number?: string;

  @ApiPropertyOptional({ example: "Acme Plan" })
  @IsOptional()
  @IsString()
  group_name?: string;

  @ApiPropertyOptional({ example: "Self" })
  @IsOptional()
  @IsString()
  relation_to_insured?: string;

  @ApiPropertyOptional({ example: "2026-01-01" })
  @IsOptional()
  @IsDateString()
  effective_date?: string;

  @ApiPropertyOptional({ example: "2026-12-31" })
  @IsOptional()
  @IsDateString()
  expiration_date?: string;

  @ApiPropertyOptional({
    description: "Storage key or URL of the front of the card",
  })
  @IsOptional()
  @IsString()
  image1?: string;

  @ApiPropertyOptional({
    description: "Storage key or URL of the back of the card",
  })
  @IsOptional()
  @IsString()
  image2?: string;
}

export class CreatePatientDto {
  @ApiProperty({ type: DemographyDto })
  @ValidateNested()
  @Type(() => DemographyDto)
  demography: DemographyDto;

  @ApiPropertyOptional({ type: [EnrollmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnrollmentDto)
  enrollments?: EnrollmentDto[];

  @ApiPropertyOptional({ type: [EmergencyContactDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergency_contacts?: EmergencyContactDto[];

  @ApiPropertyOptional({ type: [InsuranceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InsuranceDto)
  insurances?: InsuranceDto[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  no_insurance?: boolean;
}

export class UpdatePatientDto extends CreatePatientDto {
  @ApiPropertyOptional({ type: DemographyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DemographyDto)
  declare demography: DemographyDto;

  @ApiPropertyOptional({
    description: "Emergency contact ids to remove",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deleted_emergency_contacts?: string[];

  @ApiPropertyOptional({
    description: "Insurance ids to remove",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deleted_insurances?: string[];
}

export class QueryPatientsDto {
  @ApiPropertyOptional({ description: "Search on name, email, phone or MRN" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "Filter by provider group id" })
  @IsOptional()
  @IsString()
  group_id?: string;

  @ApiPropertyOptional({ description: "Filter by enrolled program category" })
  @IsOptional()
  @IsString()
  program?: string;

  @ApiPropertyOptional({ description: "Filter by patient status" })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: "created_at" })
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
}
