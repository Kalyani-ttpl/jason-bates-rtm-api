import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "provider@jason-rtm.com" })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "Provider@123" })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    description:
      "Keep the refresh cookie after the browser closes. Without it the refresh cookie is a session cookie.",
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  remember_me?: boolean;
}

export class RefreshTokenDto {
  @ApiPropertyOptional({
    description:
      "Only needed without cookies (Swagger, API tools). The browser app sends the refresh_token cookie instead.",
  })
  @IsOptional()
  @IsString()
  refresh?: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  current_password: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  new_password: string;
}
