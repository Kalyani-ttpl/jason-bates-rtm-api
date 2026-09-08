import { Injectable } from "@nestjs/common";
import { BaseService } from "../common/base.service";
import { AuthenticatedUser } from "../common/constants";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateTemplateDto,
  QueryTemplatesDto,
  UpdateTemplateDto,
} from "./dto/template.dto";

/** Bulk communication templates, plus the static patient portal message templates. */
@Injectable()
export class TemplateService extends BaseService {
  constructor(private readonly prisma: PrismaService) {
    super(TemplateService.name);
  }

  async create(data: CreateTemplateDto, user: AuthenticatedUser) {
    try {
      const { provider_group_id, ...templateData } = data;

      return await this.prisma.bulk_communication_template.create({
        data: {
          ...templateData,
          provider_group_id: provider_group_id
            ? BigInt(provider_group_id)
            : null,
          created_by_id: user.providerId,
        },
      });
    } catch (error) {
      this.handleError(error, "Failed to create template");
    }
  }

  async findAll(param: QueryTemplatesDto) {
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
        ...(param.template_type && { template_type: param.template_type }),
        ...(param.achieved && { achieved: param.achieved === "true" }),
        ...(param.provider_group_id && {
          provider_group_id: BigInt(param.provider_group_id),
        }),
        ...(param.search && {
          OR: [
            { title: { contains: param.search, mode: "insensitive" as const } },
            {
              subject: { contains: param.search, mode: "insensitive" as const },
            },
            {
              template_body: {
                contains: param.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }),
      };

      const [rows, count] = await Promise.all([
        prisma.bulk_communication_template.findMany({
          where,
          take: pageSize,
          skip: (pageNo - 1) * pageSize,
          orderBy: { [sortBy]: orderBy },
        }),
        prisma.bulk_communication_template.count({ where }),
      ]);

      const totalPages = Math.ceil(count / pageSize);
      return {
        count,
        next: pageNo < totalPages ? pageNo + 1 : null,
        previous: pageNo > 1 ? pageNo - 1 : null,
        results: rows,
      };
    } catch (error) {
      this.handleError(error, "Failed to fetch templates");
    }
  }

  async findSmsTemplates(param: QueryTemplatesDto) {
    return this.findAll({ ...param, template_type: "sms" });
  }

  /**
   * Updates a template and records the before/after content as a revision so
   * changes to patient-facing wording stay auditable.
   */
  async update(id: bigint, data: UpdateTemplateDto, user: AuthenticatedUser) {
    try {
      const { provider_group_id, ...templateData } = data;

      const existing = await this.prisma.bulk_communication_template.findUnique(
        {
          where: { id },
        },
      );
      this.throwNotFoundError(existing, `Template with id '${id}' not found`);

      return await this.prisma.$transaction(async (tx) => {
        const updated = await tx.bulk_communication_template.update({
          where: { id },
          data: {
            ...templateData,
            ...(provider_group_id !== undefined && {
              provider_group_id: provider_group_id
                ? BigInt(provider_group_id)
                : null,
            }),
            updated_by_id: user.providerId,
            ...(data.achieved && { achieved_by_id: user.providerId }),
          },
        });

        await tx.bulk_communication_template_revision.create({
          data: {
            template_id: id,
            old_title: existing!.title,
            new_title: updated.title,
            old_content: existing!.template_body,
            new_content: updated.template_body,
            revision_by_id: user.providerId,
          },
        });

        return updated;
      });
    } catch (error) {
      this.handleError(error, "Failed to update template");
    }
  }

  async remove(id: bigint) {
    try {
      const existing = await this.prisma.bulk_communication_template.findUnique(
        {
          where: { id },
        },
      );
      this.throwNotFoundError(existing, `Template with id '${id}' not found`);

      await this.prisma.bulk_communication_template.delete({
        where: { id },
      });

      return { detail: "Template deleted successfully", id };
    } catch (error) {
      this.handleError(error, "Failed to delete template");
    }
  }

  /**
   * Canned messages the patient portal offers. Static in Zenara too; the
   * patient's name is interpolated once patient records exist.
   */
  patientPortalTemplates(patientName = "") {
    const greeting = patientName ? `Hi, I'm ${patientName}.` : "Hi,";
    return {
      reschedule: {
        label: "Reschedule Appointment",
        message: `${greeting} I won't be able to make it to my appointment tomorrow. Can we please reschedule to a later date? Thanks!`,
      },
      cancel: {
        label: "Cancel Appointment",
        message: `${greeting} I won't be able to make it to my appointment. Please cancel it for now. I'll reach out to reschedule later. Thanks!`,
      },
    };
  }
}
