import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AuthenticatedUser } from "../common/constants";
import { ParseBigIntPipe } from "../common/pipes/parse-bigint.pipe";
import {
  AssignEducationDto,
  CancelScheduleDto,
  CreateEducationDto,
  QueryAssignedPatientsDto,
  QueryEducationDto,
  QuerySchedulesDto,
  ScheduleEducationDto,
  UpdateScheduleDto,
} from "./dto/education.dto";
import { EducationService } from "./education.service";

/** Paths follow Zenara, including its `archieved` spelling. */
@ApiTags("Education Materials")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class EducationController {
  constructor(private readonly education: EducationService) {}

  @Post("educations")
  @ApiOperation({ summary: "Create an education material" })
  create(
    @Body() data: CreateEducationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.education.create(data, user);
  }

  @Get("educations")
  @ApiOperation({ summary: "List education materials" })
  findAll(@Query() query: QueryEducationDto) {
    return this.education.findAll(query);
  }

  @Get("educations/patient/:patientId")
  @ApiOperation({ summary: "List the materials assigned to a patient" })
  findForPatient(
    @Param("patientId", ParseBigIntPipe) patientId: bigint,
    @Query() query: QueryEducationDto,
  ) {
    return this.education.findAll(query, patientId);
  }

  @Get("educations/patient/:patientId/schedule-education")
  @ApiOperation({ summary: "List a patient's scheduled materials" })
  findPatientSchedules(
    @Param("patientId", ParseBigIntPipe) patientId: bigint,
    @Query() query: QuerySchedulesDto,
  ) {
    return this.education.findSchedules(query, { patientId });
  }

  @Post("educations/:id/assign")
  @ApiOperation({ summary: "Assign a material to patients" })
  assign(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: AssignEducationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.education.assign(id, data, user);
  }

  @Get("educations/:id/assigned-patients")
  @ApiOperation({ summary: "List the patients a material is assigned to" })
  findAssignedPatients(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Query() query: QueryAssignedPatientsDto,
  ) {
    return this.education.findAssignedPatients(id, query);
  }

  @Post("educations/:id/new-schedule")
  @ApiOperation({ summary: "Schedule a material to be sent to patients" })
  schedule(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Body() data: ScheduleEducationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.education.schedule(id, data, user);
  }

  @Get("educations/:id/get-schedules")
  @ApiOperation({ summary: "List a material's schedules" })
  findSchedules(
    @Param("id", ParseBigIntPipe) id: bigint,
    @Query() query: QuerySchedulesDto,
  ) {
    return this.education.findSchedules(query, { educationId: id });
  }

  @Patch("education-schedules/:id/cancel-schedule")
  @ApiOperation({ summary: "Cancel a pending schedule" })
  cancelSchedule(
    @Param("id", ParseBigIntPipe) id: bigint,
    // Validated so the frontend's body is accepted; the whole schedule is cancelled.
    @Body() _data: CancelScheduleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.education.cancelSchedule(id, user);
  }

  @Patch("education-schedules/:scheduleId/update-schedule")
  @ApiOperation({ summary: "Move a pending schedule's send time" })
  updateSchedule(
    @Param("scheduleId", ParseBigIntPipe) scheduleId: bigint,
    @Body() data: UpdateScheduleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.education.updateSchedule(scheduleId, data, user);
  }

  @Post("educations/:id/archieved")
  @ApiOperation({ summary: "Archive a material" })
  archive(
    @Param("id", ParseBigIntPipe) id: bigint,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.education.setArchived(id, true, user);
  }

  @Post("educations/:id/unarchieved")
  @ApiOperation({ summary: "Unarchive a material" })
  unarchive(
    @Param("id", ParseBigIntPipe) id: bigint,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.education.setArchived(id, false, user);
  }
}
