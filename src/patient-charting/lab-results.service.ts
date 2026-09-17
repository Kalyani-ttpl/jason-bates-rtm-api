import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AuthenticatedUser } from "../common/constants";
import { PrismaService } from "../prisma/prisma.service";
import { ChartingBaseService } from "./charting-base.service";
import { ChartingQueryDto, CreateLabResultDto } from "./dto/charting.dto";

const NOT_FOUND = "Lab result not found";

const SORT_FIELDS: Record<string, string> = {
  created_at: "created_at",
  updated_at: "updated_at",
  lab_result_for: "lab_result_for",
  value: "value",
  recorded_at: "recorded_at",
  abnormal_flag: "abnormal_flag",
};

@Injectable()
export class LabResultsService extends ChartingBaseService {
  constructor(prisma: PrismaService) {
    super(prisma, LabResultsService.name);
  }

  /** Lab Results tab: test name, date, value and abnormal flag. */
  async findAll(patientId: bigint, param: ChartingQueryDto) {
    try {
      await this.assertPatient(patientId);
      const page = this.page(param, SORT_FIELDS, "created_at");

      const where: Prisma.LabResultWhereInput = {
        patient_id: patientId,
        is_deleted: param.is_deleted ?? false,
        ...(param.search && {
          OR: [
            { lab_result_for: { contains: param.search, mode: "insensitive" } },
            { value: { contains: param.search, mode: "insensitive" } },
            { note: { contains: param.search, mode: "insensitive" } },
          ],
        }),
      };

      const [rows, count] = await Promise.all([
        this.prisma.labResult.findMany({
          where,
          include: {
            files: { select: { id: true, file: true, title: true } },
          },
          skip: page.skip,
          take: page.take,
          orderBy: page.orderBy,
        }),
        this.prisma.labResult.count({ where }),
      ]);

      return this.envelope(rows, count, page);
    } catch (error) {
      this.handleError(error, "Failed to fetch lab results");
    }
  }

  /**
   * Creates a lab result, or updates it when the body carries an id. Extra
   * report files are replaced wholesale, alongside the row, in one transaction.
   */
  async save(
    patientId: bigint,
    data: CreateLabResultDto,
    user: AuthenticatedUser,
  ) {
    try {
      await this.assertPatient(patientId);
      const fields = {
        lab_result_for: data.lab_result_for,
        value: data.value,
        abnormal_flag: data.abnormal_flag,
        recorded_at: this.toDate(data.recorded_at) ?? new Date(),
        note: data.note,
        file: data.file,
        file_type: data.file_type,
        is_track: data.is_track ?? false,
        is_draft: data.is_draft ?? false,
        updated_by_id: user.providerId,
      };

      const id = data.id ? await this.existing(patientId, data.id) : null;

      const saved = await this.prisma.$transaction(async (tx) => {
        const row = id
          ? await tx.labResult.update({ where: { id }, data: fields })
          : await tx.labResult.create({
              data: {
                patient_id: patientId,
                created_by_id: user.providerId,
                ...fields,
              },
            });

        if (data.additional_files) {
          await tx.labResultFile.deleteMany({
            where: { lab_result_id: row.id },
          });
          if (data.additional_files.length) {
            await tx.labResultFile.createMany({
              data: data.additional_files.map((file) => ({
                lab_result_id: row.id,
                file,
              })),
            });
          }
        }

        return row;
      });

      return {
        detail: id
          ? "Lab result updated successfully"
          : "Lab result created successfully",
        id: saved.id,
      };
    } catch (error) {
      this.handleError(error, "Failed to save lab result");
    }
  }

  async remove(patientId: bigint, id: bigint, user: AuthenticatedUser) {
    try {
      await this.assertPatient(patientId);
      await this.existing(patientId, id);

      await this.prisma.labResult.update({
        where: { id },
        data: { is_deleted: true, updated_by_id: user.providerId },
      });
      return { detail: "Lab result deleted successfully" };
    } catch (error) {
      this.handleError(error, "Failed to delete lab result");
    }
  }

  private async existing(patientId: bigint, id: bigint | number) {
    const rowId = BigInt(id);
    const row = await this.prisma.labResult.findFirst({
      where: { id: rowId, patient_id: patientId },
      select: { id: true },
    });
    this.throwNotFoundError(row, NOT_FOUND);
    return rowId;
  }
}
