import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AuthenticatedUser } from "../common/constants";
import { PrismaService } from "../prisma/prisma.service";
import { ChartingBaseService } from "./charting-base.service";
import { ChartingQueryDto, CreateAllergyDto } from "./dto/charting.dto";

const NOT_FOUND = "Allergy not found";

const SORT_FIELDS: Record<string, string> = {
  created_at: "createdAt",
  updated_at: "updatedAt",
  name: "name",
  severity: "severity",
  criticality: "criticality",
  onset_date: "onsetDate",
};

@Injectable()
export class AllergiesService extends ChartingBaseService {
  constructor(prisma: PrismaService) {
    super(prisma, AllergiesService.name);
  }

  /** Allergies tab. */
  async findAll(patientId: bigint, param: ChartingQueryDto) {
    try {
      await this.assertPatient(patientId);
      const page = this.page(param, SORT_FIELDS, "created_at");

      const where: Prisma.PatientAllergyWhereInput = {
        patientId,
        isDeleted: param.is_deleted ?? false,
        ...(param.search && {
          OR: [
            { name: { contains: param.search, mode: "insensitive" } },
            { reaction: { contains: param.search, mode: "insensitive" } },
            { notes: { contains: param.search, mode: "insensitive" } },
          ],
        }),
      };

      const [rows, count] = await Promise.all([
        this.prisma.patientAllergy.findMany({
          where,
          skip: page.skip,
          take: page.take,
          orderBy: page.orderBy,
        }),
        this.prisma.patientAllergy.count({ where }),
      ]);

      return this.envelope(rows.map(toResponse), count, page);
    } catch (error) {
      this.handleError(error, "Failed to fetch allergies");
    }
  }

  /** Creates an allergy, or updates it when the body carries an id. */
  async save(
    patientId: bigint,
    data: CreateAllergyDto,
    user: AuthenticatedUser,
  ) {
    try {
      await this.assertPatient(patientId);
      const fields = {
        name: data.name,
        reaction: data.reaction,
        severity: data.severity,
        criticality: data.criticality,
        onsetDate: this.toDate(data.onset_date),
        notes: data.notes,
        isSourceEhr: data.is_source_ehr ?? false,
        updatedById: user.providerId,
      };

      if (data.id) {
        const id = await this.existing(patientId, data.id);
        await this.prisma.patientAllergy.update({
          where: { id },
          data: fields,
        });
        return { detail: "Allergy updated successfully", id };
      }

      const created = await this.prisma.patientAllergy.create({
        data: { patientId, ...fields },
      });
      return { detail: "Allergy created successfully", id: created.id };
    } catch (error) {
      this.handleError(error, "Failed to save allergy");
    }
  }

  async remove(patientId: bigint, id: bigint, user: AuthenticatedUser) {
    try {
      await this.assertPatient(patientId);
      await this.existing(patientId, id);

      await this.prisma.patientAllergy.update({
        where: { id },
        data: {
          isDeleted: true,
          isActive: false,
          updatedById: user.providerId,
        },
      });
      return { detail: "Allergy deleted successfully" };
    } catch (error) {
      this.handleError(error, "Failed to delete allergy");
    }
  }

  private async existing(patientId: bigint, id: bigint | number) {
    const rowId = BigInt(id);
    const row = await this.prisma.patientAllergy.findFirst({
      where: { id: rowId, patientId },
      select: { id: true },
    });
    this.throwNotFoundError(row, NOT_FOUND);
    return rowId;
  }
}

/** `patient_allergies` is camelCase; the API stays snake_case. */
function toResponse(row: Prisma.PatientAllergyGetPayload<object>) {
  return {
    id: row.id,
    uuid: row.uuid,
    name: row.name,
    reaction: row.reaction,
    severity: row.severity,
    criticality: row.criticality,
    onset_date: row.onsetDate,
    notes: row.notes,
    is_source_ehr: row.isSourceEhr,
    is_active: row.isActive,
    is_deleted: row.isDeleted,
    updated_by: row.updatedById,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}
