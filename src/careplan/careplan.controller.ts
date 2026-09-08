import { Body, Controller, HttpCode, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CareplanService } from "./careplan.service";
import { CheckCarePlanDto, CheckCarePlanResponseDto } from "./dto/careplan.dto";

@ApiTags("Care Plans")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("careplans")
export class CareplanController {
  constructor(private readonly careplanService: CareplanService) {}

  @Post("check-careplan")
  @HttpCode(200)
  @ApiOperation({ summary: "Check whether a care plan title is already taken" })
  @ApiResponse({ status: 200, type: CheckCarePlanResponseDto })
  checkCarePlan(@Body() payload: CheckCarePlanDto) {
    return this.careplanService.checkCarePlan(payload);
  }
}
