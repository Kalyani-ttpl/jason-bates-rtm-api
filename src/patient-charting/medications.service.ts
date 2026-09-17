import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AuthenticatedUser } from "../common/constants";
import { PrismaService } from "../prisma/prisma.service";
import { ChartingBaseService } from "./charting-base.service";
import { ChartingQueryDto, CreateMedicationDto } from "./dto/charting.dto";

const NOT_FOUND = "Medication not found";

const SORT_FIELDS: Record<string, string> = {
  created_at: "createdAt",
  updated_at: "updatedAt",
  name: "name",
  medicine: "name",
  status: "status",
  start_at: "startDate",
  end_at: "endDate",
};

@Injectable()
export class MedicationsService extends ChartingBaseService {
  constructor(prisma: PrismaService) {
    super(prisma, MedicationsService.name);
  }

  /**
   * Medications tab. `past` splits the list: a medication is past once it has
   * an end date in the past or has been marked inactive.
   */
  async findAll(patientId: bigint, param: ChartingQueryDto, past = false) {
    try {
      await this.assertPatient(patientId);
      const page = this.page(param, SORT_FIELDS, "created_at");

      const ended: Prisma.PatientMedicationWhereInput = {
        OR: [{ endDate: { lt: new Date() } }, { isActive: false }],
      };

      const where: Prisma.PatientMedicationWhereInput = {
        patientId,
        isDeleted: param.is_deleted ?? false,
        ...(past ? ended : { NOT: ended }),
        ...(param.search && {
          OR: [
            { name: { contains: param.search, mode: "insensitive" } },
            { sig: { contains: param.search, mode: "insensitive" } },
            { notes: { contains: param.search, mode: "insensitive" } },
          ],
        }),
      };

      const [rows, count] = await Promise.all([
        this.prisma.patientMedication.findMany({
          where,
          include: {
            prescribedBy: {
              select: { id: true, first_name: true, last_name: true },
            },
          },
          skip: page.skip,
          take: page.take,
          orderBy: page.orderBy,
        }),
        this.prisma.patientMedication.count({ where }),
      ]);

      return this.envelope(rows.map(toResponse), count, page);
    } catch (error) {
      this.handleError(error, "Failed to fetch medications");
    }
  }

  /** Creates a medication, or updates it when the body carries an id. */
  async save(
    patientId: bigint,
    data: CreateMedicationDto,
    user: AuthenticatedUser,
  ) {
    try {
      await this.assertPatient(patientId);
      const fields = {
        name: data.medicine,
        status: data.status,
        sig: data.sig,
        unit: data.unit,
        takenWhen: data.when,
        route: data.route,
        frequency: data.frequency,
        days: data.days,
        startDate: this.toDate(data.start_at),
        endDate: this.toDate(data.end_at),
        forLifetime: data.for_lifetime ?? false,
        notes: data.note,
        isSourceEhr: data.is_source_ehr ?? false,
        updatedById: user.providerId,
      };

      if (data.id) {
        const id = await this.existing(patientId, data.id);
        await this.prisma.patientMedication.update({
          where: { id },
          data: fields,
        });
        return { detail: "Medication updated successfully", id };
      }

      const created = await this.prisma.patientMedication.create({
        data: { patientId, prescribedById: user.providerId, ...fields },
      });
      return { detail: "Medication created successfully", id: created.id };
    } catch (error) {
      this.handleError(error, "Failed to save medication");
    }
  }

  async remove(patientId: bigint, id: bigint, user: AuthenticatedUser) {
    try {
      await this.assertPatient(patientId);
      await this.existing(patientId, id);

      await this.prisma.patientMedication.update({
        where: { id },
        data: {
          isDeleted: true,
          isActive: false,
          updatedById: user.providerId,
        },
      });
      return { detail: "Medication deleted successfully" };
    } catch (error) {
      this.handleError(error, "Failed to delete medication");
    }
  }

  private async existing(patientId: bigint, id: bigint | number) {
    const rowId = BigInt(id);
    const row = await this.prisma.patientMedication.findFirst({
      where: { id: rowId, patientId },
      select: { id: true },
    });
    this.throwNotFoundError(row, NOT_FOUND);
    return rowId;
  }
}

/** `patient_medications` is camelCase; the API stays snake_case. */
function toResponse(
  row: Prisma.PatientMedicationGetPayload<{
    include: { prescribedBy: { select: { id: true } } };
  }>,
) {
  return {
    id: row.id,
    uuid: row.uuid,
    medicine: row.name,
    status: row.status,
    sig: row.sig,
    unit: row.unit,
    when: row.takenWhen,
    route: row.route,
    frequency: row.frequency,
    days: row.days,
    start_at: row.startDate,
    end_at: row.endDate,
    for_lifetime: row.forLifetime,
    note: row.notes,
    is_source_ehr: row.isSourceEhr,
    is_active: row.isActive,
    is_deleted: row.isDeleted,
    prescribed_by: row.prescribedBy,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}
