import { BadRequestException, Injectable } from "@nestjs/common";
import { BaseService } from "../common/base.service";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateIcdCodeDto,
  QueryIcdCodesDto,
  UpdateIcdCodeDto,
} from "./dto/icd-code.dto";

@Injectable()
export class IcdCodeService extends BaseService {
  constructor(private readonly prisma: PrismaService) {
    super(IcdCodeService.name);
  }

  /** Creates an ICD code, rejecting a code that already exists. */
  async create(data: CreateIcdCodeDto) {
    try {
      const prisma = this.prisma;

      const existing = await prisma.icd_code.findFirst({
        where: { code: data.code },
      });
      if (existing) {
        throw new BadRequestException(
          `ICD code with code '${data.code}' already exists`,
        );
      }

      const created = await prisma.icd_code.create({
        data,
      });

      return this.toResponse(created);
    } catch (error) {
      this.handleError(error, "Failed to create ICD code");
    }
  }

  /**
   * Bulk imports ICD codes, skipping any code that already exists. Returns
   * a per-code outcome so the caller can show what was skipped.
   */
  async bulkUpload(codes: CreateIcdCodeDto[]) {
    try {
      const prisma = this.prisma;

      const submitted = codes.map((entry) => entry.code);
      const existing = await prisma.icd_code.findMany({
        where: { code: { in: submitted } },
        select: { code: true },
      });
      const taken = new Set(existing.map((row) => row.code));

      const toCreate = codes.filter((entry) => !taken.has(entry.code));
      if (toCreate.length) {
        await prisma.icd_code.createMany({
          data: toCreate,
        });
      }

      return {
        detail: `${toCreate.length} of ${codes.length} ICD codes imported`,
        imported: toCreate.map((entry) => entry.code),
        skipped: submitted.filter((code) => taken.has(code)),
      };
    } catch (error) {
      this.handleError(error, "Failed to import ICD codes");
    }
  }

  /** Returns a paginated, searchable and sortable list of ICD codes. */
  async findAll(param: QueryIcdCodesDto) {
    try {
      const prisma = this.prisma;

      const pageNo = Math.max(Number(param.page_no) || 1, 1);
      const pageSize = Math.min(
        Math.max(Number(param.page_size) || 15, 1),
        100,
      );
      const sortBy = param.sort_by ?? "created_at";
      const orderBy = param.order_by ?? "desc";

      const where = {
        ...(param.status && { status: param.status }),
        ...(param.is_unspecified && {
          is_unspecified: param.is_unspecified === "true",
        }),
        ...(param.search && {
          OR: [
            { code: { contains: param.search, mode: "insensitive" as const } },
            {
              description: {
                contains: param.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }),
      };

      const [rows, count] = await Promise.all([
        prisma.icd_code.findMany({
          where,
          take: pageSize,
          skip: (pageNo - 1) * pageSize,
          orderBy: { [sortBy]: orderBy },
        }),
        prisma.icd_code.count({ where }),
      ]);

      const totalPages = Math.ceil(count / pageSize);
      return {
        count,
        next: pageNo < totalPages ? pageNo + 1 : null,
        previous: pageNo > 1 ? pageNo - 1 : null,
        results: rows.map((row) => this.toResponse(row)),
      };
    } catch (error) {
      this.handleError(error, "Failed to fetch ICD codes");
    }
  }

  async findOne(id: bigint) {
    try {
      const found = await this.prisma.icd_code.findUnique({
        where: { id },
      });
      this.throwNotFoundError(found, `ICD code with id '${id}' not found`);

      return this.toResponse(found!);
    } catch (error) {
      this.handleError(error, "Failed to fetch ICD code");
    }
  }

  /** Updates an ICD code, rejecting a code already used by another record. */
  async update(id: bigint, data: UpdateIcdCodeDto) {
    try {
      const prisma = this.prisma;

      const existing = await prisma.icd_code.findUnique({ where: { id } });
      this.throwNotFoundError(existing, `ICD code with id '${id}' not found`);

      if (data.code) {
        const duplicate = await prisma.icd_code.findFirst({
          where: { code: data.code, NOT: { id } },
        });
        if (duplicate) {
          throw new BadRequestException(
            `ICD code with code '${data.code}' already exists`,
          );
        }
      }

      const updated = await prisma.icd_code.update({ where: { id }, data });
      return this.toResponse(updated);
    } catch (error) {
      this.handleError(error, "Failed to update ICD code");
    }
  }

  async remove(id: bigint) {
    try {
      const existing = await this.prisma.icd_code.findUnique({
        where: { id },
      });
      this.throwNotFoundError(existing, `ICD code with id '${id}' not found`);

      await this.prisma.icd_code.delete({ where: { id } });
      return { detail: "ICD code deleted successfully", id };
    } catch (error) {
      this.handleError(error, "Failed to delete ICD code");
    }
  }

  private toResponse(item: {
    id: bigint;
    uuid: string;
    created_at: Date | null;
    updated_at: Date | null;
    description: string | null;
    code: string | null;
    status: string;
    is_unspecified: boolean;
    is_hipaa_covered: string | null;
    order_number: string | null;
  }) {
    return {
      id: item.id,
      uuid: item.uuid,
      created_at: item.created_at,
      updated_at: item.updated_at,
      description: item.description,
      code: item.code,
      status: item.status,
      is_unspecified: item.is_unspecified,
      is_hipaa_covered: item.is_hipaa_covered,
      order_number: item.order_number,
      value: item.id,
      label: item.description
        ? `${item.code} - ${item.description}`
        : `${item.code}`,
    };
  }
}
