import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "provider@jason-rtm.com" })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "Provider@123" })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: "jason", description: "Tenant slug" })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: "tenant must be a lowercase slug",
  })
  tenant: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refresh: string;
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
