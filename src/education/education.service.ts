import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { BaseService } from "../common/base.service";
import { AuthenticatedUser } from "../common/constants";
import { PrismaService } from "../prisma/prisma.service";
import {
  AssignEducationDto,
  CreateEducationDto,
  QueryAssignedPatientsDto,
  QueryEducationDto,
  QuerySchedulesDto,
  ScheduleEducationDto,
  UpdateScheduleDto,
} from "./dto/education.dto";

export const SCHEDULED = "schedule";
export const CANCELLED = "cancel";

const NOT_FOUND = "Education material not found";
const SCHEDULE_NOT_FOUND = "Schedule not found";

const MATERIAL_INCLUDE = {
  conditions: {
    select: { condition_id: true, condition: { select: { title: true } } },
  },
  assignments: { select: { patientId: true } },
} satisfies Prisma.EducationMaterialInclude;

type MaterialRow = Prisma.EducationMaterialGetPayload<{
  include: typeof MATERIAL_INCLUDE;
}>;

const PERSON = { select: { id: true, first_name: true, last_name: true } };
const PATIENT = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
  },
};

const SCHEDULE_INCLUDE = {
  send_by: PERSON,
  scheduled_by: PERSON,
  cancelled_by: PERSON,
  patients: { select: { patient: PATIENT } },
  education: { include: MATERIAL_INCLUDE },
} satisfies Prisma.EducationScheduleInclude;

type ScheduleRow = Prisma.EducationScheduleGetPayload<{
  include: typeof SCHEDULE_INCLUDE;
}>;

@Injectable()
export class EducationService extends BaseService {
  constructor(private readonly prisma: PrismaService) {
    super(EducationService.name);
  }

  /** Creates a material and links its conditions. */
  async create(data: CreateEducationDto, user: AuthenticatedUser) {
    try {
      const duplicate = await this.prisma.educationMaterial.findFirst({
        where: { title: { equals: data.title, mode: "insensitive" } },
        select: { id: true },
      });
      if (duplicate) this.throwConflictError("Provided title already exists");

      await this.assertConditionsExist(data.conditions);
      const groupId = data.provider_group ? BigInt(data.provider_group) : null;
      if (groupId) {
        const group = await this.prisma.providerGroup.findUnique({
          where: { id: groupId },
          select: { id: true },
        });
        this.throwNotFoundError(group, `Provider group ${groupId} not found`);
      }

      const material = await this.prisma.$transaction(async (tx) => {
        const created = await tx.educationMaterial.create({
          data: {
            title: data.title,
            description: data.description,
            url: data.file ?? "",
            fileType: fileTypeOf(data.file),
            isActive: data.is_active ?? false,
            isArchived: false,
            specialities: data.specialities ?? Prisma.DbNull,
            userTypes: data.user_types ?? Prisma.DbNull,
            providerGroupId: groupId,
            addedById: user.providerId,
          },
        });

        if (data.conditions?.length) {
          await tx.educationMaterialCondition.createMany({
            data: [...new Set(data.conditions)].map((id) => ({
              education_material_id: created.id,
              condition_id: BigInt(id),
            })),
          });
        }

        return tx.educationMaterial.findUniqueOrThrow({
          where: { id: created.id },
          include: MATERIAL_INCLUDE,
        });
      });

      return this.toMaterial(material);
    } catch (error) {
      this.handleError(error, "Failed to create education material");
    }
  }

  /** The material library, or only what one patient has been assigned. */
  async findAll(query: QueryEducationDto, patientId?: bigint) {
    try {
      if (patientId) await this.assertPatientsExist([patientId]);

      const pageNo = Math.max(Number(query.page_no) || 1, 1);
      const pageSize = Math.min(
        Math.max(Number(query.page_size) || 10, 1),
        100,
      );
      const orderBy: Prisma.EducationMaterialOrderByWithRelationInput =
        query.sort_by === "title"
          ? { title: query.order_by ?? "asc" }
          : { createdAt: query.order_by ?? "desc" };

      // Each filter is its own AND clause. Zenara assigns `speciality` and
      // `user_types` to the same `OR` key, so the second silently replaces the first.
      const and: Prisma.EducationMaterialWhereInput[] = [];
      const csv = (value?: string) =>
        (value ?? "")
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean);

      const specialities = csv(query.speciality);
      if (specialities.length) {
        and.push({
          OR: specialities.map((spec) => ({
            specialities: { array_contains: [spec] },
          })),
        });
      }
      const userTypes = csv(query.user_types);
      if (userTypes.length) {
        and.push({
          OR: userTypes.map((type) => ({
            userTypes: { array_contains: [type] },
          })),
        });
      }
      const conditionIds = csv(query.condition)
        .filter((id) => /^\d+$/.test(id))
        .map((id) => BigInt(id));
      if (conditionIds.length) {
        and.push({
          conditions: { some: { condition_id: { in: conditionIds } } },
        });
      }

      const where: Prisma.EducationMaterialWhereInput = {
        isArchived: query.is_archived === "true",
        ...(patientId && { assignments: { some: { patientId } } }),
        ...(query.group_id && { providerGroupId: BigInt(query.group_id) }),
        ...(query.search && {
          title: { contains: query.search, mode: "insensitive" },
        }),
        ...(and.length && { AND: and }),
      };

      const [rows, count] = await Promise.all([
        this.prisma.educationMaterial.findMany({
          where,
          include: MATERIAL_INCLUDE,
          orderBy,
          skip: (pageNo - 1) * pageSize,
          take: pageSize,
        }),
        this.prisma.educationMaterial.count({ where }),
      ]);

      const totalPages = Math.ceil(count / pageSize);
      return {
        count,
        next: pageNo < totalPages ? pageNo + 1 : null,
        previous: pageNo > 1 ? pageNo - 1 : null,
        results: rows.map((row) => this.toMaterial(row)),
      };
    } catch (error) {
      this.handleError(error, "Failed to fetch education materials");
    }
  }

  /**
   * Gives the material to each patient. Everything is checked first, so one
   * already-assigned patient cannot leave the rest half-done.
   */
  async assign(id: bigint, data: AssignEducationDto, user: AuthenticatedUser) {
    try {
      const material = await this.findMaterial(id);
      const patientIds = [...new Set(data.patient)].map((pid) => BigInt(pid));
      await this.assertPatientsExist(patientIds);

      const existing = await this.prisma.patientEducationMaterial.findMany({
        where: { educationMaterialId: id, patientId: { in: patientIds } },
        select: { patientId: true },
      });
      if (existing.length) {
        this.throwBadRequestError(
          `Education material is already assigned to patient ${existing
            .map((row) => row.patientId)
            .join(", ")}`,
        );
      }

      // The patient row keeps its own copy of the title and file, as the
      // shared `patient_education_materials` table expects.
      await this.prisma.patientEducationMaterial.createMany({
        data: patientIds.map((patientId) => ({
          patientId,
          educationMaterialId: id,
          assignedById: user.providerId,
          name: material.title,
          type: material.fileType,
          url: material.url,
          description: material.description,
          note: data.note,
        })),
      });

      return {
        detail: "Education material assigned successfully",
        patient: data.patient,
        note: data.note,
      };
    } catch (error) {
      this.handleError(error, "Failed to assign education material");
    }
  }

  /** The patients a material has been assigned to, newest first by default. */
  async findAssignedPatients(id: bigint, query: QueryAssignedPatientsDto) {
    try {
      await this.findMaterial(id);

      const pageNo = Math.max(Number(query.page_no) || 1, 1);
      const pageSize = Math.min(
        Math.max(Number(query.page_size) || 10, 1),
        100,
      );
      const direction = query.order_by === "asc" ? "asc" : "desc";
      const orderBy: Prisma.PatientEducationMaterialOrderByWithRelationInput =
        query.sort_by === "note"
          ? { note: direction }
          : { createdAt: direction };
      const where = { educationMaterialId: id };

      const [rows, totalCount] = await Promise.all([
        this.prisma.patientEducationMaterial.findMany({
          where,
          include: { patient: PATIENT, assignedBy: PERSON },
          orderBy,
          skip: (pageNo - 1) * pageSize,
          take: pageSize,
        }),
        this.prisma.patientEducationMaterial.count({ where }),
      ]);

      return {
        data: rows.map((row) => ({
          id: row.id,
          note: row.note,
          created_at: row.createdAt,
          patient: this.toPatient(row.patient),
          created_by: row.assignedBy,
        })),
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        pageSize,
        currentPage: pageNo,
      };
    } catch (error) {
      this.handleError(error, "Failed to fetch assigned patients");
    }
  }

  /** One schedule per patient, so each can be cancelled or moved on its own. */
  async schedule(
    id: bigint,
    data: ScheduleEducationDto,
    user: AuthenticatedUser,
  ) {
    try {
      await this.findMaterial(id);
      const patientIds = [...new Set(data.patients)].map((pid) => BigInt(pid));

      const patients = await this.prisma.patient.findMany({
        where: { id: { in: patientIds } },
        select: { id: true, firstName: true, lastName: true, email: true },
      });
      const missing = patientIds.filter(
        (pid) => !patients.some((p) => p.id === pid),
      );
      if (missing.length) {
        this.throwNotFoundError(
          null,
          `Patient not found: ${missing.join(", ")}`,
        );
      }
      const noEmail = patients.filter((p) => !p.email);
      if (noEmail.length) {
        this.throwBadRequestError(
          `No email for: ${noEmail.map((p) => `${p.firstName} ${p.lastName}`).join(", ")}`,
        );
      }

      const sender = await this.prisma.provider.findUnique({
        where: { id: BigInt(data.send_by) },
        select: { id: true },
      });
      this.throwNotFoundError(sender, `Provider ${data.send_by} not found`);

      const schedules = await this.prisma.$transaction(
        patientIds.map((patientId) =>
          this.prisma.educationSchedule.create({
            data: {
              education_id: id,
              status: SCHEDULED,
              send_at: new Date(data.send_at),
              send_by_id: BigInt(data.send_by),
              scheduled_by_id: user.providerId,
              patients: { create: { patient_id: patientId } },
            },
            include: SCHEDULE_INCLUDE,
          }),
        ),
      );

      return schedules.map((row) => this.toSchedule(row, false));
    } catch (error) {
      this.handleError(error, "Failed to schedule education material");
    }
  }

  /** A material's schedules, or one patient's, newest send time first. */
  async findSchedules(
    query: QuerySchedulesDto,
    scope: { educationId?: bigint; patientId?: bigint },
  ) {
    try {
      if (scope.educationId) await this.findMaterial(scope.educationId);
      if (scope.patientId) await this.assertPatientsExist([scope.patientId]);

      const pageNo = Math.max(Number(query.page_no) || 1, 1);
      const pageSize = Math.min(
        Math.max(Number(query.page_size) || 10, 1),
        100,
      );
      const sort = (query.sort_by ?? "").toLowerCase();
      const orderBy: Prisma.EducationScheduleOrderByWithRelationInput[] =
        sort === "title_asc" || sort === "title_desc"
          ? [
              { education: { title: sort === "title_asc" ? "asc" : "desc" } },
              { send_at: "desc" },
            ]
          : [{ send_at: "desc" }];

      const where: Prisma.EducationScheduleWhereInput = {
        ...(scope.educationId && { education_id: scope.educationId }),
        ...(scope.patientId && {
          patients: { some: { patient_id: scope.patientId } },
        }),
        ...(query.schedule_status && { status: query.schedule_status }),
      };

      const [rows, totalCount] = await Promise.all([
        this.prisma.educationSchedule.findMany({
          where,
          include: SCHEDULE_INCLUDE,
          orderBy,
          skip: (pageNo - 1) * pageSize,
          take: pageSize,
        }),
        this.prisma.educationSchedule.count({ where }),
      ]);

      return {
        data: rows.map((row) => this.toSchedule(row, true)),
        pagination: {
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
          currentPage: pageNo,
          pageSize,
        },
      };
    } catch (error) {
      this.handleError(error, "Failed to fetch schedules");
    }
  }

  /** Only a schedule that has not gone out yet can be cancelled. */
  async cancelSchedule(id: bigint, user: AuthenticatedUser) {
    try {
      await this.findPendingSchedule(id);

      await this.prisma.educationSchedule.update({
        where: { id },
        data: {
          status: CANCELLED,
          cancelled_at: new Date(),
          cancelled_by_id: user.providerId,
          updated_by_id: user.providerId,
        },
      });
      return { detail: "Education material schedule cancelled successfully" };
    } catch (error) {
      this.handleError(error, "Failed to cancel schedule");
    }
  }

  /** Moves the send time of a schedule that has not gone out yet. */
  async updateSchedule(
    id: bigint,
    data: UpdateScheduleDto,
    user: AuthenticatedUser,
  ) {
    try {
      await this.findPendingSchedule(id);

      await this.prisma.educationSchedule.update({
        where: { id },
        data: {
          send_at: new Date(data.send_at),
          updated_by_id: user.providerId,
        },
      });
      return { detail: "Education material schedule updated" };
    } catch (error) {
      this.handleError(error, "Failed to update schedule");
    }
  }

  async setArchived(id: bigint, archived: boolean, user: AuthenticatedUser) {
    try {
      await this.findMaterial(id);

      await this.prisma.educationMaterial.update({
        where: { id },
        data: archived
          ? { isArchived: true, archivedById: user.providerId }
          : { isArchived: false, unarchivedById: user.providerId },
      });
      return {
        detail: archived
          ? "Education material archived successfully"
          : "Education material unarchived successfully",
      };
    } catch (error) {
      this.handleError(error, "Failed to update education material");
    }
  }

  private async findMaterial(id: bigint) {
    const material = await this.prisma.educationMaterial.findUnique({
      where: { id },
    });
    this.throwNotFoundError(material, NOT_FOUND);
    return material!;
  }

  private async findPendingSchedule(id: bigint) {
    const schedule = await this.prisma.educationSchedule.findUnique({
      where: { id },
      select: { status: true },
    });
    this.throwNotFoundError(schedule, SCHEDULE_NOT_FOUND);
    if (schedule!.status !== SCHEDULED) {
      this.throwBadRequestError(`Schedule is already ${schedule!.status}`);
    }
  }

  private async assertPatientsExist(ids: bigint[]) {
    const found = await this.prisma.patient.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const missing = ids.filter((id) => !found.some((row) => row.id === id));
    if (missing.length) {
      this.throwNotFoundError(null, `Patient not found: ${missing.join(", ")}`);
    }
  }

  private async assertConditionsExist(ids?: number[]) {
    if (!ids?.length) return;
    const wanted = [...new Set(ids)].map((id) => BigInt(id));
    const found = await this.prisma.condition.findMany({
      where: { id: { in: wanted } },
      select: { id: true },
    });
    const missing = wanted.filter((id) => !found.some((row) => row.id === id));
    if (missing.length) {
      this.throwBadRequestError(`Condition not found: ${missing.join(", ")}`);
    }
  }

  /** `education_materials` is camelCase; the API keeps Zenara's snake_case. */
  private toMaterial(row: MaterialRow) {
    return {
      id: row.id,
      uuid: row.uuid,
      title: row.title,
      description: row.description,
      speciality: row.speciality,
      specialities: row.specialities,
      user_types: row.userTypes,
      file: row.url || null,
      file_type: row.fileType,
      is_active: row.isActive,
      is_archived: row.isArchived,
      provider_group: row.providerGroupId,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
      conditions: row.conditions.map((link) => link.condition_id),
      condition_title: row.conditions.map((link) => link.condition.title),
      patient: row.assignments.map((assignment) => assignment.patientId),
    };
  }

  private toSchedule(row: ScheduleRow, withEducation: boolean) {
    return {
      id: row.id,
      send_at: row.send_at,
      status: row.status,
      created_at: row.created_at,
      send_by: row.send_by,
      scheduled_by: row.scheduled_by,
      cancelled_at: row.cancelled_at,
      cancelled_by: row.cancelled_by,
      patients: row.patients.map((link) => this.toPatient(link.patient)),
      ...(withEducation && { education: this.toMaterial(row.education) }),
    };
  }

  private toPatient(patient: {
    id: bigint;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  }) {
    return {
      id: patient.id,
      first_name: patient.firstName,
      last_name: patient.lastName,
      email: patient.email,
      phone: patient.phone,
    };
  }
}

/** `data:application/pdf;base64,...` → `PDF`, matching Zenara. */
export function fileTypeOf(file?: string) {
  return (
    file
      ?.match(/^data:(.*?);base64,/)?.[1]
      ?.split("/")[1]
      ?.toUpperCase() ?? null
  );
}
