import { BadRequestException, Injectable } from "@nestjs/common";
import { BaseService } from "../common/base.service";
import { AuthenticatedUser } from "../common/constants";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateTaskTypeDto,
  QueryTaskTypesDto,
  UpdateTaskTypeDto,
} from "./dto/task-type.dto";

/** Activity Types in the UI; core_tasktype in Zenara. */
@Injectable()
export class TaskTypeService extends BaseService {
  constructor(private readonly prisma: PrismaService) {
    super(TaskTypeService.name);
  }

  async create(data: CreateTaskTypeDto, user: AuthenticatedUser) {
    try {
      const { provider_group_id, ...taskTypeData } = data;

      const existing = await this.prisma.task_type.findFirst({
        where: {
          title: data.title,
          provider_group_id: provider_group_id
            ? BigInt(provider_group_id)
            : null,
        },
      });
      if (existing) {
        throw new BadRequestException(
          `Activity type '${data.title}' already exists`,
        );
      }

      return await this.prisma.task_type.create({
        data: {
          ...taskTypeData,
          provider_group_id: provider_group_id
            ? BigInt(provider_group_id)
            : null,
          created_by_id: user.providerId,
        },
      });
    } catch (error) {
      this.handleError(error, "Failed to create activity type");
    }
  }

  async findAll(param: QueryTaskTypesDto) {
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
        ...(param.is_archived && { is_archived: param.is_archived === "true" }),
        ...(param.provider_group_id && {
          provider_group_id: BigInt(param.provider_group_id),
        }),
        ...(param.search && {
          title: { contains: param.search, mode: "insensitive" as const },
        }),
      };

      const [rows, count] = await Promise.all([
        prisma.task_type.findMany({
          where,
          take: pageSize,
          skip: (pageNo - 1) * pageSize,
          orderBy: { [sortBy]: orderBy },
        }),
        prisma.task_type.count({ where }),
      ]);

      const totalPages = Math.ceil(count / pageSize);
      return {
        count,
        next: pageNo < totalPages ? pageNo + 1 : null,
        previous: pageNo > 1 ? pageNo - 1 : null,
        results: rows,
      };
    } catch (error) {
      this.handleError(error, "Failed to fetch activity types");
    }
  }

  async update(id: bigint, data: UpdateTaskTypeDto) {
    try {
      const { provider_group_id, ...taskTypeData } = data;

      const existing = await this.prisma.task_type.findUnique({
        where: { id },
      });
      this.throwNotFoundError(
        existing,
        `Activity type with id '${id}' not found`,
      );

      return await this.prisma.task_type.update({
        where: { id },
        data: {
          ...taskTypeData,
          ...(provider_group_id !== undefined && {
            provider_group_id: provider_group_id
              ? BigInt(provider_group_id)
              : null,
          }),
        },
      });
    } catch (error) {
      this.handleError(error, "Failed to update activity type");
    }
  }

  async remove(id: bigint) {
    try {
      const existing = await this.prisma.task_type.findUnique({
        where: { id },
      });
      this.throwNotFoundError(
        existing,
        `Activity type with id '${id}' not found`,
      );

      await this.prisma.task_type.delete({ where: { id } });

      return { detail: "Activity type deleted successfully", id };
    } catch (error) {
      this.handleError(error, "Failed to delete activity type");
    }
  }
}
