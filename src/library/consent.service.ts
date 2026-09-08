import { Injectable } from "@nestjs/common";
import { BaseService } from "../common/base.service";
import { AuthenticatedUser } from "../common/constants";
import { PrismaService } from "../prisma/prisma.service";
import { ADDITIONAL_CONSENT_TEMPLATES } from "./data/additional-consent-templates";
import {
  CopyConsentDto,
  CreateConsentDto,
  QueryConsentsDto,
  UpdateConsentDto,
} from "./dto/consent.dto";

@Injectable()
export class ConsentService extends BaseService {
  constructor(private readonly prisma: PrismaService) {
    super(ConsentService.name);
  }

  async create(data: CreateConsentDto, user: AuthenticatedUser) {
    try {
      return await this.prisma.consent.create({
        data: {
          ...data,
          created_by_id: user.providerId,
        },
      });
    } catch (error) {
      this.handleError(error, "Failed to create consent");
    }
  }

  async findAll(param: QueryConsentsDto) {
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
        is_deleted: false,
        ...(param.program && { program: param.program }),
        ...(param.search && {
          title: { contains: param.search, mode: "insensitive" as const },
        }),
      };

      const [rows, count] = await Promise.all([
        prisma.consent.findMany({
          where,
          take: pageSize,
          skip: (pageNo - 1) * pageSize,
          orderBy: { [sortBy]: orderBy },
          include: {
            created_by: {
              select: { id: true, first_name: true, last_name: true },
            },
          },
        }),
        prisma.consent.count({ where }),
      ]);

      const totalPages = Math.ceil(count / pageSize);
      return {
        count,
        next: pageNo < totalPages ? pageNo + 1 : null,
        previous: pageNo > 1 ? pageNo - 1 : null,
        results: rows,
      };
    } catch (error) {
      this.handleError(error, "Failed to fetch consents");
    }
  }

  async findOne(id: bigint) {
    try {
      const consent = await this.prisma.consent.findFirst({
        where: { id, is_deleted: false },
        include: {
          created_by: {
            select: { id: true, first_name: true, last_name: true },
          },
        },
      });
      this.throwNotFoundError(consent, `Consent with id '${id}' not found`);

      return consent;
    } catch (error) {
      this.handleError(error, "Failed to fetch consent");
    }
  }

  async update(id: bigint, data: UpdateConsentDto) {
    try {
      const existing = await this.prisma.consent.findFirst({
        where: { id, is_deleted: false },
      });
      this.throwNotFoundError(existing, `Consent with id '${id}' not found`);

      return await this.prisma.consent.update({ where: { id }, data });
    } catch (error) {
      this.handleError(error, "Failed to update consent");
    }
  }

  /** Soft deletes, matching Zenara, so signed consents stay auditable. */
  async remove(id: bigint, user: AuthenticatedUser) {
    try {
      const existing = await this.prisma.consent.findFirst({
        where: { id, is_deleted: false },
      });
      this.throwNotFoundError(existing, `Consent with id '${id}' not found`);

      await this.prisma.consent.update({
        where: { id },
        data: {
          is_deleted: true,
          deleted_at: new Date(),
          deleted_by_id: user.providerId,
        },
      });

      return { detail: "Consent deleted successfully", id };
    } catch (error) {
      this.handleError(error, "Failed to delete consent");
    }
  }

  /** Returns the stored consent body for rendering by the caller. */
  async preview(id: bigint) {
    try {
      const consent = await this.prisma.consent.findFirst({
        where: { id, is_deleted: false },
        include: {
          created_by: {
            select: { id: true, first_name: true, last_name: true },
          },
        },
      });
      this.throwNotFoundError(consent, `Consent with id '${id}' not found`);

      return {
        id: consent!.id,
        uuid: consent!.uuid,
        title: consent!.title,
        program: consent!.program,
        content: consent!.file,
        created_by: consent!.created_by,
        created_at: consent!.created_at,
      };
    } catch (error) {
      this.handleError(error, "Failed to preview consent");
    }
  }

  async copy(id: bigint, data: CopyConsentDto, user: AuthenticatedUser) {
    try {
      const source = await this.prisma.consent.findFirst({
        where: { id, is_deleted: false },
      });
      this.throwNotFoundError(source, `Consent with id '${id}' not found`);

      return await this.prisma.consent.create({
        data: {
          title: data.title,
          program: data.program ?? source!.program,
          file: source!.file,
          created_by_id: user.providerId,
        },
      });
    } catch (error) {
      this.handleError(error, "Failed to copy consent");
    }
  }

  /** Static in Zenara; no table backs this list. */
  additionalConsentTemplates() {
    return ADDITIONAL_CONSENT_TEMPLATES;
  }
}
