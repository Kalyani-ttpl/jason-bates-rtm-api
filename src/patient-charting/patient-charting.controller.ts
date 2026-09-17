import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../common/constants";
import { ParseBigIntPipe } from "../common/pipes/parse-bigint.pipe";
import { AllergiesService } from "./allergies.service";
import { ConditionsService } from "./conditions.service";
import {
  ChartingQueryDto,
  CreateAllergyDto,
  CreateLabResultDto,
  CreateMedicationDto,
  CreateSymptomDto,
  PatientConditionDto,
} from "./dto/charting.dto";
import { LabResultsService } from "./lab-results.service";
import { MedicationsService } from "./medications.service";
import { SymptomsService } from "./symptoms.service";

/** The patient charting tabs. Paths follow Zenara, so the frontend is unchanged. */
@ApiTags("Patient Charting")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class PatientChartingController {
  constructor(
    private readonly conditions: ConditionsService,
    private readonly symptoms: SymptomsService,
    private readonly allergies: AllergiesService,
    private readonly medications: MedicationsService,
    private readonly labResults: LabResultsService,
  ) {}

  @Get("v2/patients/clinicals/:id/conditions")
  @ApiOperation({ summary: "Conditions tab" })
  findConditions(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Query() query: ChartingQueryDto,
  ) {
    return this.conditions.findAll(id, query);
  }

  @Post("patients/:id/handle-patient-conditions")
  @ApiOperation({ summary: "Add, update and delete conditions in one call" })
  handleConditions(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() rows: PatientConditionDto[],
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.conditions.handle(id, rows, user);
  }

  @Get("v2/patients/clinicals/:id/symptoms")
  @ApiOperation({ summary: "Symptoms tab" })
  findSymptoms(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Query() query: ChartingQueryDto,
  ) {
    return this.symptoms.findAll(id, query);
  }

  @Post("patients/:id/symptom")
  @ApiOperation({ summary: "Create or update a symptom" })
  saveSymptom(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: CreateSymptomDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.symptoms.save(id, data, user);
  }

  @Delete("patients/:id/symptom/:symptomId")
  @ApiOperation({ summary: "Delete a symptom" })
  removeSymptom(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Param("symptomId", ParseBigIntPipe) symptomId: bigint,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.symptoms.remove(id, symptomId, user);
  }

  @Get("v2/patients/clinicals/:id/allergies")
  @ApiOperation({ summary: "Allergies tab" })
  findAllergies(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Query() query: ChartingQueryDto,
  ) {
    return this.allergies.findAll(id, query);
  }

  @Post("patients/:id/allergies")
  @ApiOperation({ summary: "Create or update an allergy" })
  saveAllergy(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: CreateAllergyDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.allergies.save(id, data, user);
  }

  @Delete("patients/:id/allergies/:allergyId")
  @ApiOperation({ summary: "Delete an allergy" })
  removeAllergy(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Param("allergyId", ParseBigIntPipe) allergyId: bigint,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.allergies.remove(id, allergyId, user);
  }

  @Get("v2/patients/clinicals/:id/current-medications")
  @ApiOperation({ summary: "Medications tab, current" })
  findCurrentMedications(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Query() query: ChartingQueryDto,
  ) {
    return this.medications.findAll(id, query);
  }

  @Get("v2/patients/clinicals/:id/past-medications")
  @ApiOperation({ summary: "Medications tab, past" })
  findPastMedications(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Query() query: ChartingQueryDto,
  ) {
    return this.medications.findAll(id, query, true);
  }

  @Post("patients/:id/medications")
  @ApiOperation({ summary: "Create or update a medication" })
  saveMedication(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: CreateMedicationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.medications.save(id, data, user);
  }

  @Delete("patients/:id/medications/:medicationId")
  @ApiOperation({ summary: "Delete a medication" })
  removeMedication(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Param("medicationId", ParseBigIntPipe) medicationId: bigint,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.medications.remove(id, medicationId, user);
  }

  @Get("v2/patients/clinicals/:id/lab-results")
  @ApiOperation({ summary: "Lab Results tab" })
  findLabResults(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Query() query: ChartingQueryDto,
  ) {
    return this.labResults.findAll(id, query);
  }

  @Post("patients/:id/labs")
  @ApiOperation({ summary: "Create or update a lab result" })
  saveLabResult(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: CreateLabResultDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.labResults.save(id, data, user);
  }

  @Delete("patients/:id/labs/:labId")
  @ApiOperation({ summary: "Delete a lab result" })
  removeLabResult(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Param("labId", ParseBigIntPipe) labId: bigint,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.labResults.remove(id, labId, user);
  }
}
