import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AuthenticatedUser } from "../common/constants";
import { PrismaService } from "../prisma/prisma.service";
import { ChartingBaseService } from "./charting-base.service";
import {
  ChartingAction,
  ChartingQueryDto,
  PatientConditionDto,
} from "./dto/charting.dto";

const NOT_FOUND = "Patient condition not found";

const SORT_FIELDS: Record<string, string> = {
  created_at: "created_at",
  updated_at: "updated_at",
  status: "status",
  type: "type",
  onset_date: "onset_date",
};

@Injectable()
export class ConditionsService extends ChartingBaseService {
  constructor(prisma: PrismaService) {
    super(prisma, ConditionsService.name);
  }

  /** Conditions tab: the patient's conditions with their library entry. */
  async findAll(patientId: bigint, param: ChartingQueryDto) {
    try {
      await this.assertPatient(patientId);
      const page = this.page(param, SORT_FIELDS, "created_at");

      const where: Prisma.PatientConditionWhereInput = {
        patient_id: patientId,
        is_deleted: param.is_deleted ?? false,
        ...(param.search && {
          condition: {
            title: { contains: param.search, mode: "insensitive" },
          },
        }),
      };

      const [rows, count] = await Promise.all([
        this.prisma.patientCondition.findMany({
          where,
          include: {
            condition: {
              select: { id: true, title: true, description: true },
            },
          },
          skip: page.skip,
          take: page.take,
          orderBy: page.orderBy,
        }),
        this.prisma.patientCondition.count({ where }),
      ]);

      return this.envelope(rows, count, page);
    } catch (error) {
      this.handleError(error, "Failed to fetch patient conditions");
    }
  }

  /**
   * The conditions tab saves the whole grid in one call, each row carrying an
   * `action`. Everything runs in one transaction so a bad row saves nothing.
   */
  async handle(
    patientId: bigint,
    rows: PatientConditionDto[],
    user: AuthenticatedUser,
  ) {
    try {
      await this.assertPatient(patientId);
      await this.assertRowsResolvable(patientId, rows);

      const counts = { added: 0, updated: 0, deleted: 0 };

      await this.prisma.$transaction(async (tx) => {
        for (const row of rows) {
          if (row.action === ChartingAction.Add) {
            await tx.patientCondition.create({
              data: {
                patient_id: patientId,
                condition_id: row.condition ? BigInt(row.condition) : null,
                ...this.toFields(row),
                updated_by_id: user.providerId,
              },
            });
            counts.added += 1;
            continue;
          }

          const id = BigInt(row.id!);
          if (row.action === ChartingAction.Delete) {
            await tx.patientCondition.update({
              where: { id },
              data: { is_deleted: true, updated_by_id: user.providerId },
            });
            counts.deleted += 1;
            continue;
          }

          await tx.patientCondition.update({
            where: { id },
            data: {
              ...(row.condition !== undefined && {
                condition_id: BigInt(row.condition),
              }),
              ...this.toFields(row),
              updated_by_id: user.providerId,
            },
          });
          counts.updated += 1;
        }
      });

      return { detail: "Patient conditions saved successfully", ...counts };
    } catch (error) {
      this.handleError(error, "Failed to save patient conditions");
    }
  }

  /**
   * Update and delete rows must name an existing condition of this patient, and
   * added rows must point at a real library condition. Checked before the
   * transaction so a bad id reports itself instead of failing on a constraint.
   */
  private async assertRowsResolvable(
    patientId: bigint,
    rows: PatientConditionDto[],
  ) {
    const existingIds = rows
      .filter((row) => row.action !== ChartingAction.Add)
      .map((row) => row.id);

    if (existingIds.some((id) => id === undefined)) {
      this.throwBadRequestError("id is required to update or delete a row");
    }

    if (existingIds.length) {
      const ids = existingIds.map((id) => BigInt(id!));
      const found = await this.prisma.patientCondition.findMany({
        where: { id: { in: ids }, patient_id: patientId },
        select: { id: true },
      });
      const missing = ids.filter((id) => !found.some((row) => row.id === id));
      if (missing.length) {
        this.throwNotFoundError(null, `${NOT_FOUND}: ${missing.join(", ")}`);
      }
    }

    const libraryIds = rows
      .map((row) => row.condition)
      .filter((id): id is number => id !== undefined)
      .map((id) => BigInt(id));

    if (libraryIds.length) {
      const found = await this.prisma.condition.findMany({
        where: { id: { in: libraryIds } },
        select: { id: true },
      });
      const missing = libraryIds.filter(
        (id) => !found.some((row) => row.id === id),
      );
      if (missing.length) {
        this.throwBadRequestError(`Condition not found: ${missing.join(", ")}`);
      }
    }
  }

  private toFields(row: PatientConditionDto) {
    return {
      ...(row.status !== undefined && { status: row.status }),
      ...(row.type !== undefined && { type: row.type }),
      ...(row.onset_date !== undefined && {
        onset_date: this.toDate(row.onset_date),
      }),
      ...(row.last_occurence !== undefined && {
        last_occurence: this.toDate(row.last_occurence),
      }),
      ...(row.notes !== undefined && { notes: row.notes }),
      ...(row.is_complex !== undefined && { is_complex: row.is_complex }),
      ...(row.is_source_ehr !== undefined && {
        is_source_ehr: row.is_source_ehr,
      }),
    };
  }
}
