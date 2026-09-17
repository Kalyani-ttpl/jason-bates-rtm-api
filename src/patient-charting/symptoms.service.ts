import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AuthenticatedUser } from "../common/constants";
import { PrismaService } from "../prisma/prisma.service";
import { ChartingBaseService } from "./charting-base.service";
import { ChartingQueryDto, CreateSymptomDto } from "./dto/charting.dto";

const NOT_FOUND = "Symptom not found";

const SORT_FIELDS: Record<string, string> = {
  created_at: "created_at",
  updated_at: "updated_at",
  description: "description",
};

@Injectable()
export class SymptomsService extends ChartingBaseService {
  constructor(prisma: PrismaService) {
    super(prisma, SymptomsService.name);
  }

  /** Symptoms tab. */
  async findAll(patientId: bigint, param: ChartingQueryDto) {
    try {
      await this.assertPatient(patientId);
      const page = this.page(param, SORT_FIELDS, "created_at");

      const where: Prisma.SymptomWhereInput = {
        patient_id: patientId,
        is_deleted: param.is_deleted ?? false,
        ...(param.search && {
          OR: [
            { description: { contains: param.search, mode: "insensitive" } },
            { note: { contains: param.search, mode: "insensitive" } },
          ],
        }),
      };

      const [rows, count] = await Promise.all([
        this.prisma.symptom.findMany({
          where,
          skip: page.skip,
          take: page.take,
          orderBy: page.orderBy,
        }),
        this.prisma.symptom.count({ where }),
      ]);

      return this.envelope(rows, count, page);
    } catch (error) {
      this.handleError(error, "Failed to fetch symptoms");
    }
  }

  /** Creates a symptom, or updates it when the body carries an id. */
  async save(
    patientId: bigint,
    data: CreateSymptomDto,
    user: AuthenticatedUser,
  ) {
    try {
      await this.assertPatient(patientId);

      if (data.id) {
        const id = await this.existing(patientId, data.id);
        await this.prisma.symptom.update({
          where: { id },
          data: {
            description: data.description,
            note: data.note,
            updated_by_id: user.providerId,
          },
        });
        return { detail: "Symptom updated successfully", id };
      }

      const created = await this.prisma.symptom.create({
        data: {
          patient_id: patientId,
          description: data.description,
          note: data.note,
          updated_by_id: user.providerId,
        },
      });
      return { detail: "Symptom created successfully", id: created.id };
    } catch (error) {
      this.handleError(error, "Failed to save symptom");
    }
  }

  /** Soft delete, so the row still exists behind `is_deleted=true`. */
  async remove(patientId: bigint, id: bigint, user: AuthenticatedUser) {
    try {
      await this.assertPatient(patientId);
      await this.existing(patientId, id);

      await this.prisma.symptom.update({
        where: { id },
        data: { is_deleted: true, updated_by_id: user.providerId },
      });
      return { detail: "Symptom deleted successfully" };
    } catch (error) {
      this.handleError(error, "Failed to delete symptom");
    }
  }

  private async existing(patientId: bigint, id: bigint | number) {
    const rowId = BigInt(id);
    const row = await this.prisma.symptom.findFirst({
      where: { id: rowId, patient_id: patientId },
      select: { id: true },
    });
    this.throwNotFoundError(row, NOT_FOUND);
    return rowId;
  }
}
