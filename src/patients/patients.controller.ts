import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ParseBigIntPipe } from "../common/pipes/parse-bigint.pipe";
import {
  CreatePatientDto,
  DuplicatePatientCheckDto,
  QueryPatientsDto,
  UpdatePatientDto,
} from "./dto/patient.dto";
import { PatientsService } from "./patients.service";

@ApiTags("Patients")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post("patients/duplication-check")
  @HttpCode(200)
  @ApiOperation({ summary: "Check whether a matching patient already exists" })
  duplicateCheck(@Body() payload: DuplicatePatientCheckDto) {
    return this.patientsService.duplicateCheck(payload);
  }

  @Post("patients/create-patient-with-all-details")
  @ApiOperation({ summary: "Onboard a patient with all their details" })
  create(@Body() payload: CreatePatientDto) {
    return this.patientsService.create(payload);
  }

  @Post("patients/:id/update-patient-with-all-details")
  @HttpCode(200)
  @ApiOperation({ summary: "Update an onboarded patient's details" })
  update(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() payload: UpdatePatientDto,
  ) {
    return this.patientsService.update(id, payload);
  }

  @Get("patients/:id/profile")
  @ApiOperation({ summary: "Get a patient's full onboarding record" })
  findProfile(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.patientsService.findProfile(id);
  }

  @Get("patients/:id/patient-demography")
  @ApiOperation({ summary: "Get a patient's demographics" })
  findDemography(@Param("id", ParseBigIntPipe) id: bigint) {
    return this.patientsService.findDemography(id);
  }

  @Get("v2/patients/all-patients")
  @ApiOperation({ summary: "List patients" })
  findAll(@Query() query: QueryPatientsDto) {
    return this.patientsService.findAll(query);
  }
}
