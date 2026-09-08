import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { BaseService } from "../common/base.service";
import { PrismaService } from "../prisma/prisma.service";
import { CPT_HCPCS_CODES } from "./data/cpt-hcpcs-codes";
import {
  CreateCptCodeDto,
  QueryCptCodesDto,
  QueryCptHcpcsDto,
  UpdateCptCodeDto,
} from "./dto/cpt-code.dto";

/** The API speaks snake_case; `cpt_codes` follows `schema (2).prisma` camelCase. */
const SORT_FIELDS: Record<string, string> = {
  created_at: "createdAt",
  updated_at: "updatedAt",
  description: "description",
  code: "code",
  category: "category",
  global_period: "globalPeriod",
  status: "status",
  is_favorite: "isFavorite",
};

@Injectable()
export class CptCodeService extends BaseService {
  constructor(private readonly prisma: PrismaService) {
    super(CptCodeService.name);
  }

  /** Creates a CPT code, rejecting a code that already exists. */
  async create(data: CreateCptCodeDto) {
    try {
      const prisma = this.prisma;

      const existing = await prisma.cptCode.findFirst({
        where: { code: data.code },
      });
      if (existing) {
        throw new BadRequestException(
          `CPT code with code '${data.code}' already exists`,
        );
      }

      const created = await prisma.cptCode.create({
        data: this.toPrisma(data),
      });

      return this.toResponse(created);
    } catch (error) {
      this.handleError(error, "Failed to create CPT code");
    }
  }

  /** Reference CPT/HCPCS lookup. Static in Zenara, so it is not backed by a table. */
  findCptHcpcsCodes(param: QueryCptHcpcsDto) {
    const search = param.search?.toLowerCase();
    return CPT_HCPCS_CODES.filter(
      (entry) =>
        (!param.type || entry.type === param.type) &&
        (!search ||
          entry.code.toLowerCase().includes(search) ||
          entry.description.toLowerCase().includes(search)),
    );
  }

  /** Returns a paginated, searchable and sortable list of CPT codes. */
  async findAll(param: QueryCptCodesDto) {
    try {
      const prisma = this.prisma;

      const pageNo = Math.max(Number(param.page_no) || 1, 1);
      const pageSize = Math.min(
        Math.max(Number(param.page_size) || 15, 1),
        100,
      );
      const sortBy = SORT_FIELDS[param.sort_by ?? "created_at"];
      const orderBy = param.order_by ?? "desc";

      const where = {
        ...(param.category && { category: param.category }),
        ...(param.status && { status: param.status }),
        ...(param.is_favorite && {
          isFavorite: param.is_favorite === "true",
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
            {
              category: {
                contains: param.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }),
      };

      const [rows, count] = await Promise.all([
        prisma.cptCode.findMany({
          where,
          take: pageSize,
          skip: (pageNo - 1) * pageSize,
          orderBy: { [sortBy]: orderBy },
        }),
        prisma.cptCode.count({ where }),
      ]);

      const totalPages = Math.ceil(count / pageSize);
      return {
        count,
        next: pageNo < totalPages ? pageNo + 1 : null,
        previous: pageNo > 1 ? pageNo - 1 : null,
        results: rows.map((row) => this.toResponse(row)),
      };
    } catch (error) {
      this.handleError(error, "Failed to fetch CPT codes");
    }
  }

  async findOne(id: bigint) {
    try {
      const found = await this.prisma.cptCode.findUnique({
        where: { id },
      });
      this.throwNotFoundError(found, `CPT code with id '${id}' not found`);

      return this.toResponse(found!);
    } catch (error) {
      this.handleError(error, "Failed to fetch CPT code");
    }
  }

  /** Updates a CPT code, rejecting a code already used by another record. */
  async update(id: bigint, data: UpdateCptCodeDto) {
    try {
      const prisma = this.prisma;

      const existing = await prisma.cptCode.findUnique({ where: { id } });
      this.throwNotFoundError(existing, `CPT code with id '${id}' not found`);

      if (data.code) {
        const duplicate = await prisma.cptCode.findFirst({
          where: { code: data.code, NOT: { id } },
        });
        if (duplicate) {
          throw new BadRequestException(
            `CPT code with code '${data.code}' already exists`,
          );
        }
      }

      const updated = await prisma.cptCode.update({
        where: { id },
        data: this.toPrisma(data),
      });
      return this.toResponse(updated);
    } catch (error) {
      this.handleError(error, "Failed to update CPT code");
    }
  }

  async remove(id: bigint) {
    try {
      const existing = await this.prisma.cptCode.findUnique({
        where: { id },
      });
      this.throwNotFoundError(existing, `CPT code with id '${id}' not found`);

      await this.prisma.cptCode.delete({ where: { id } });
      return { detail: "CPT code deleted successfully", id };
    } catch (error) {
      this.handleError(error, "Failed to delete CPT code");
    }
  }

  private toPrisma(data: UpdateCptCodeDto): Prisma.CptCodeCreateInput {
    return {
      ...(data.code !== undefined && { code: data.code }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.global_period !== undefined && {
        globalPeriod: data.global_period,
      }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.is_favorite !== undefined && { isFavorite: data.is_favorite }),
    };
  }

  private toResponse(item: {
    id: bigint;
    uuid: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    description: string | null;
    code: string | null;
    category: string | null;
    globalPeriod: number | null;
    status: string;
    isFavorite: boolean;
  }) {
    return {
      id: item.id,
      uuid: item.uuid,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
      description: item.description,
      code: item.code,
      category: item.category,
      global_period: item.globalPeriod,
      status: item.status,
      is_favorite: item.isFavorite,
      value: item.id,
      label: item.description
        ? `${item.code} - ${item.description}`
        : `${item.code}`,
    };
  }
}
