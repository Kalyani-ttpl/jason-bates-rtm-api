import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { BaseService } from "../common/base.service";
import { AuthenticatedUser, QType } from "../common/constants";
import { PrismaService } from "../prisma/prisma.service";
import {
  CheckCarePlanDto,
  CopyCarePlanDto,
  CreateCarePlanDto,
  CreateCarePlanQuestionDto,
  QueryCarePlanQuestionsDto,
  QueryCarePlansDto,
  SectionDto,
  UpdateCarePlanDto,
  UpdateCarePlanQuestionDto,
} from "./dto/careplan.dto";

const TITLE_EXISTS = "Care Plan already exist with same name";
const TITLE_AVAILABLE = "Care Plan with this name does not exist";
const NOT_FOUND = "Care-Plan not found";
const QUESTION_NOT_FOUND = "Care-Plan question not found";

/** The API speaks snake_case; these map a `sort_by` value onto a Prisma field. */
const SORT_FIELDS: Record<string, string> = {
  id: "id",
  title: "title",
  created_at: "created_at",
  updated_at: "updated_at",
};

/** A `type` filter matches every spelling of the same section. */
const QUESTION_TYPE_GROUPS: Record<string, string[]> = {
  [QType.GeneralQuestions]: [QType.GeneralQuestions, QType.General],
  [QType.General]: [QType.GeneralQuestions, QType.General],
  [QType.Support]: [QType.Support, QType.Supports, QType.SupportQuestions],
  [QType.Supports]: [QType.Support, QType.Supports, QType.SupportQuestions],
  [QType.SupportQuestions]: [
    QType.Support,
    QType.Supports,
    QType.SupportQuestions,
  ],
};

const LIST_INCLUDE = {
  conditions: { select: { condition: true } },
  icd_codes: {
    select: {
      icdcode: { select: { id: true, code: true, description: true } },
    },
  },
  creator: {
    select: { id: true, email: true, first_name: true, last_name: true },
  },
} satisfies Prisma.CarePlanInclude;

const DETAIL_INCLUDE = {
  ...LIST_INCLUDE,
  tasks: {
    select: {
      id: true,
      title: true,
      action: true,
      priority: true,
      template_id: true,
      template: { select: { title: true } },
    },
  },
  questions: {
    select: { type: true },
    orderBy: { created_at: "asc" },
  },
} satisfies Prisma.CarePlanInclude;

type CarePlanListRow = Prisma.CarePlanGetPayload<{
  include: typeof LIST_INCLUDE;
}>;

type CarePlanDetailRow = Prisma.CarePlanGetPayload<{
  include: typeof DETAIL_INCLUDE;
}>;

@Injectable()
export class CareplanService extends BaseService {
  constructor(private readonly prisma: PrismaService) {
    super(CareplanService.name);
  }

  /**
   * Tells the care plan form whether a title is already taken. When `id` is
   * supplied the care plan being edited is excluded, so keeping its own title
   * is not reported as a clash.
   */
  async checkCarePlan(payload: CheckCarePlanDto) {
    try {
      const prisma = this.prisma;

      if (payload.id) {
        const id = BigInt(payload.id);
        const existing = await prisma.carePlan.findUnique({ where: { id } });
        this.throwNotFoundError(existing, NOT_FOUND);

        const duplicate = await prisma.carePlan.findFirst({
          where: {
            title: { equals: payload.title, mode: "insensitive" },
            NOT: { id },
          },
        });
        return this.buildResponse(duplicate !== null);
      }

      const duplicate = await prisma.carePlan.findFirst({
        where: { title: { equals: payload.title, mode: "insensitive" } },
      });
      return this.buildResponse(duplicate !== null);
    } catch (error) {
      this.handleError(error, "Failed to check care plan");
    }
  }

  /**
   * Creates a care plan with its conditions, ICD codes, tasks and the questions
   * carried by each section. Everything lands in one transaction so a bad
   * section cannot leave a half-built plan behind.
   */
  async create(data: CreateCarePlanDto, user: AuthenticatedUser) {
    try {
      await this.assertTitleAvailable(data.title);
      await this.assertRelationsExist(data);

      const careplan = await this.prisma.$transaction(async (tx) => {
        const created = await tx.carePlan.create({
          data: {
            title: data.title,
            description: data.description,
            support: data.support ?? false,
            allergies: data.allergies ?? false,
            medications: data.medications ?? false,
            is_active: true,
            programs: data.programs ?? [],
            creator_id: user.providerId,
            provider_group_id: data.provider_group
              ? this.toId(data.provider_group, "provider_group")
              : null,
          },
        });

        await this.replaceRelations(tx, created.id, data);
        return created;
      });

      return {
        details: "Care plan created successfully",
        careplan_id: careplan.id,
      };
    } catch (error) {
      this.handleError(error, "Failed to create care plan");
    }
  }

  /** Returns a paginated, searchable and filterable list of care plans. */
  async findAll(param: QueryCarePlansDto) {
    try {
      const pageNo = Math.max(Number(param.page_no) || 1, 1);
      const pageSize = Math.min(
        Math.max(Number(param.page_size) || 10, 1),
        100,
      );
      const sortBy = SORT_FIELDS[param.sort_by ?? "id"] ?? "id";
      const orderBy = param.order_by ?? "desc";

      const where: Prisma.CarePlanWhereInput = {
        ...(param.search && {
          title: { contains: param.search, mode: "insensitive" },
        }),
        ...(param.program && {
          programs: { array_contains: [param.program.toLowerCase()] },
        }),
        ...(param.group_id && { provider_group_id: BigInt(param.group_id) }),
        ...(param.condition && {
          conditions: {
            some: {
              condition: {
                title: { contains: param.condition, mode: "insensitive" },
              },
            },
          },
        }),
        ...this.creatorNameFilter(param.creator_name),
      };

      const [rows, count] = await Promise.all([
        this.prisma.carePlan.findMany({
          where,
          include: LIST_INCLUDE,
          take: pageSize,
          skip: (pageNo - 1) * pageSize,
          orderBy: { [sortBy]: orderBy },
        }),
        this.prisma.carePlan.count({ where }),
      ]);

      const totalPages = Math.ceil(count / pageSize);
      return {
        count,
        next: pageNo < totalPages ? pageNo + 1 : null,
        previous: pageNo > 1 ? pageNo - 1 : null,
        results: rows.map((row) => this.toListItem(row)),
      };
    } catch (error) {
      this.handleError(error, "Failed to fetch care plans");
    }
  }

  /** Returns one care plan with its conditions, ICD codes, tasks and section order. */
  async findOne(id: bigint) {
    try {
      const careplan = await this.prisma.carePlan.findUnique({
        where: { id },
        include: DETAIL_INCLUDE,
      });
      this.throwNotFoundError(careplan, NOT_FOUND);

      return this.toDetail(careplan!);
    } catch (error) {
      this.handleError(error, "Failed to fetch care plan");
    }
  }

  /**
   * Updates a care plan. Conditions, ICD codes, sections and tasks are each
   * replaced wholesale when supplied, and left untouched when omitted.
   */
  async update(id: bigint, data: UpdateCarePlanDto) {
    try {
      const existing = await this.prisma.carePlan.findUnique({ where: { id } });
      this.throwNotFoundError(existing, NOT_FOUND);

      if (data.title !== undefined && data.title !== existing!.title) {
        await this.assertTitleAvailable(data.title, id);
      }
      await this.assertRelationsExist(data);

      await this.prisma.$transaction(async (tx) => {
        await tx.carePlan.update({
          where: { id },
          data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.description !== undefined && {
              description: data.description,
            }),
            ...(data.support !== undefined && { support: data.support }),
            ...(data.allergies !== undefined && { allergies: data.allergies }),
            ...(data.medications !== undefined && {
              medications: data.medications,
            }),
            ...(data.programs !== undefined && { programs: data.programs }),
            ...(data.is_active !== undefined && { is_active: data.is_active }),
            ...(data.provider_group !== undefined && {
              provider_group_id: data.provider_group
                ? this.toId(data.provider_group, "provider_group")
                : null,
            }),
          },
        });

        await this.replaceRelations(tx, id, data, true);
      });

      return { details: "Care plan updated successfully" };
    } catch (error) {
      this.handleError(error, "Failed to update care plan");
    }
  }

  /** Deletes a care plan; its questions, conditions, ICD links and tasks cascade. */
  async remove(id: bigint) {
    try {
      const existing = await this.prisma.carePlan.findUnique({ where: { id } });
      this.throwNotFoundError(existing, NOT_FOUND);

      await this.prisma.carePlan.delete({ where: { id } });
      return { details: "Care plan deleted successfully" };
    } catch (error) {
      this.handleError(error, "Failed to delete care plan");
    }
  }

  /**
   * Duplicates a care plan along with its conditions, ICD codes and questions.
   * The copy is titled `<title> - <source id>`, as in Zenara.
   */
  async copy(id: bigint, payload: CopyCarePlanDto, user: AuthenticatedUser) {
    try {
      const source = await this.prisma.carePlan.findUnique({
        where: { id },
        include: {
          conditions: { select: { condition_id: true } },
          icd_codes: { select: { icdcode_id: true } },
          questions: true,
        },
      });
      this.throwNotFoundError(source, NOT_FOUND);

      const title = `${payload.title} - ${source!.id}`;
      await this.assertTitleAvailable(title);

      const copy = await this.prisma.$transaction(async (tx) => {
        const created = await tx.carePlan.create({
          data: {
            title,
            description: source!.description,
            support: source!.support,
            allergies: source!.allergies,
            medications: source!.medications,
            is_active: source!.is_active,
            programs: source!.programs ?? Prisma.DbNull,
            copied: true,
            copied_from_id: source!.id,
            creator_id: user.providerId,
            provider_group_id: source!.provider_group_id,
          },
        });

        if (source!.conditions.length) {
          await tx.carePlanCondition.createMany({
            data: source!.conditions.map((row) => ({
              careplan_id: created.id,
              condition_id: row.condition_id,
            })),
            skipDuplicates: true,
          });
        }

        if (source!.icd_codes.length) {
          await tx.carePlanIcdCode.createMany({
            data: source!.icd_codes.map((row) => ({
              careplan_id: created.id,
              icdcode_id: row.icdcode_id,
            })),
            skipDuplicates: true,
          });
        }

        if (source!.questions.length) {
          await tx.carePlanQuestion.createMany({
            data: source!.questions.map((question) => ({
              title: question.title,
              description: question.description,
              type: question.type,
              question_type: question.question_type,
              choices: question.choices ?? Prisma.DbNull,
              condition_id: question.condition_id,
              careplan_id: created.id,
            })),
          });
        }

        return created;
      });

      return {
        details: `Care plan copied as ${title}`,
        careplan_id: copy.id,
      };
    } catch (error) {
      this.handleError(error, "Failed to copy care plan");
    }
  }

  /** Lists a care plan's questions, optionally narrowed to one section type. */
  async findQuestions(careplanId: bigint, param: QueryCarePlanQuestionsDto) {
    try {
      const existing = await this.prisma.carePlan.findUnique({
        where: { id: careplanId },
      });
      this.throwNotFoundError(existing, NOT_FOUND);

      const group = param.type && QUESTION_TYPE_GROUPS[param.type];
      return await this.prisma.carePlanQuestion.findMany({
        where: {
          careplan_id: careplanId,
          ...(param.type && { type: group ? { in: group } : param.type }),
        },
        orderBy: { created_at: "asc" },
      });
    } catch (error) {
      this.handleError(error, "Failed to fetch care plan questions");
    }
  }

  /** Adds one question to a care plan. `careplan` in the body wins over the path id. */
  async createQuestion(careplanId: bigint, data: CreateCarePlanQuestionDto) {
    try {
      const targetId = data.careplan
        ? this.toId(data.careplan, "careplan")
        : careplanId;
      const existing = await this.prisma.carePlan.findUnique({
        where: { id: targetId },
      });
      this.throwNotFoundError(existing, NOT_FOUND);

      const question = await this.prisma.carePlanQuestion.create({
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          question_type: data.question_type,
          choices: data.choices ?? Prisma.DbNull,
          careplan_id: targetId,
        },
      });

      return {
        details: "Care plan question created successfully",
        question_id: question.id,
      };
    } catch (error) {
      this.handleError(error, "Failed to create care plan question");
    }
  }

  /** Updates one care plan question. */
  async updateQuestion(id: bigint, data: UpdateCarePlanQuestionDto) {
    try {
      const existing = await this.prisma.carePlanQuestion.findUnique({
        where: { id },
      });
      this.throwNotFoundError(existing, QUESTION_NOT_FOUND);

      await this.prisma.carePlanQuestion.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.type !== undefined && { type: data.type }),
          ...(data.question_type !== undefined && {
            question_type: data.question_type,
          }),
          ...(data.choices !== undefined && { choices: data.choices }),
          ...(data.careplan_id !== undefined && {
            careplan_id: this.toId(data.careplan_id, "careplan_id"),
          }),
        },
      });

      return { details: "Care plan question updated successfully" };
    } catch (error) {
      this.handleError(error, "Failed to update care plan question");
    }
  }

  /** Deletes one care plan question. */
  async removeQuestion(id: bigint) {
    try {
      const existing = await this.prisma.carePlanQuestion.findUnique({
        where: { id },
      });
      this.throwNotFoundError(existing, QUESTION_NOT_FOUND);

      await this.prisma.carePlanQuestion.delete({ where: { id } });
      return { details: "Care plan question deleted successfully" };
    } catch (error) {
      this.handleError(error, "Failed to delete care plan question");
    }
  }

  /**
   * Writes the conditions, ICD codes, sections and tasks of a create or update
   * payload. On update each list is cleared first, so supplying one replaces it.
   */
  private async replaceRelations(
    tx: Prisma.TransactionClient,
    careplanId: bigint,
    data: CreateCarePlanDto,
    isUpdate = false,
  ) {
    if (data.conditions?.length) {
      if (isUpdate) {
        await tx.carePlanCondition.deleteMany({
          where: { careplan_id: careplanId },
        });
      }
      await tx.carePlanCondition.createMany({
        data: data.conditions.map((id) => ({
          careplan_id: careplanId,
          condition_id: this.toId(id, "conditions"),
        })),
        skipDuplicates: true,
      });
    }

    if (data.icd_codes?.length) {
      if (isUpdate) {
        await tx.carePlanIcdCode.deleteMany({
          where: { careplan_id: careplanId },
        });
      }
      await tx.carePlanIcdCode.createMany({
        data: data.icd_codes.map((id) => ({
          careplan_id: careplanId,
          icdcode_id: this.toId(id, "icd_codes"),
        })),
        skipDuplicates: true,
      });
    }

    if (data.sections?.length) {
      if (isUpdate) {
        await tx.carePlanQuestion.deleteMany({
          where: { careplan_id: careplanId },
        });
      }
      await tx.carePlanQuestion.createMany({
        data: data.sections.flatMap((section: SectionDto) =>
          section.questions.map((question) => ({
            title: question.title,
            description: question.description,
            type: question.type || section.section_name,
            question_type: question.question_type,
            choices: question.choices ?? Prisma.DbNull,
            careplan_id: careplanId,
          })),
        ),
      });
    }

    if (data.task?.length) {
      if (isUpdate) {
        await tx.carePlanTask.deleteMany({
          where: { careplan_id: careplanId },
        });
      }
      await tx.carePlanTask.createMany({
        data: data.task.map((task) => ({
          careplan_id: careplanId,
          title: task.title,
          action: task.action,
          priority: task.priority,
          template_id: this.toId(task.template_id, "task.template_id"),
        })),
      });
    }
  }

  /**
   * Checks the linked provider group, conditions, ICD codes and task templates
   * up front. Without this the transaction fails on a foreign key and Prisma's
   * P2003 says only that some related record is missing, not which one.
   */
  private async assertRelationsExist(data: CreateCarePlanDto) {
    if (data.provider_group) {
      const id = this.toId(data.provider_group, "provider_group");
      const group = await this.prisma.providerGroup.findUnique({
        where: { id },
        select: { id: true },
      });
      this.throwNotFoundError(group, `Provider group ${id} not found`);
    }

    await this.assertIdsExist(
      data.conditions,
      "conditions",
      (ids) =>
        this.prisma.condition.findMany({
          where: { id: { in: ids } },
          select: { id: true },
        }),
      "Condition",
    );

    await this.assertIdsExist(
      data.icd_codes,
      "icd_codes",
      (ids) =>
        this.prisma.icdCode.findMany({
          where: { id: { in: ids } },
          select: { id: true },
        }),
      "ICD code",
    );

    await this.assertIdsExist(
      data.task?.map((task) => task.template_id),
      "task.template_id",
      (ids) =>
        this.prisma.bulkCommunicationTemplate.findMany({
          where: { id: { in: ids } },
          select: { id: true },
        }),
      "Template",
    );
  }

  private async assertIdsExist(
    values: (string | number)[] | undefined,
    field: string,
    lookup: (ids: bigint[]) => Promise<{ id: bigint }[]>,
    label: string,
  ) {
    if (!values?.length) return;

    const ids = values.map((value) => this.toId(value, field));
    const found = await lookup(ids);
    const missing = ids.filter((id) => !found.some((row) => row.id === id));

    if (missing.length) {
      this.throwBadRequestError(`${label} not found: ${missing.join(", ")}`);
    }
  }

  /** Route params are validated by a pipe; body ids are not, so guard here. */
  private toId(value: string | number, field: string): bigint {
    try {
      return BigInt(value);
    } catch {
      this.throwBadRequestError(`Invalid ${field}: ${value}`);
      throw new Error("unreachable");
    }
  }

  /** Rejects a title already used by another care plan, matching `check-careplan`. */
  private async assertTitleAvailable(title: string, excludeId?: bigint) {
    const duplicate = await this.prisma.carePlan.findFirst({
      where: {
        title: { equals: title, mode: "insensitive" },
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
    if (duplicate) this.throwConflictError(TITLE_EXISTS);
  }

  /** Two name parts match first and last name; one part matches either. */
  private creatorNameFilter(
    creatorName?: string,
  ): Prisma.CarePlanWhereInput | undefined {
    const parts = creatorName?.trim().split(/\s+/).filter(Boolean);
    if (!parts?.length) return undefined;

    if (parts.length >= 2) {
      return {
        creator: {
          first_name: { contains: parts[0], mode: "insensitive" },
          last_name: { contains: parts[1], mode: "insensitive" },
        },
      };
    }

    return {
      creator: {
        OR: [
          { first_name: { contains: parts[0], mode: "insensitive" } },
          { last_name: { contains: parts[0], mode: "insensitive" } },
        ],
      },
    };
  }

  /** List row: conditions as pickable options, ICD codes as display strings. */
  private toListItem(row: CarePlanListRow) {
    const { conditions, icd_codes, creator, ...careplan } = row;

    return {
      ...careplan,
      provider_group: careplan.provider_group_id,
      copied_from: careplan.copied_from_id,
      creator,
      conditions: conditions.map(({ condition }) => ({
        ...condition,
        value: condition.id,
        label: condition.title,
      })),
      icd_codes: icd_codes.map(
        ({ icdcode }) => `${icdcode.code}: ${icdcode.description}`,
      ),
      icd_code_ids: icd_codes.map(({ icdcode }) => icdcode.id),
    };
  }

  /** Detail row: the list shape plus tasks and the order sections appear in. */
  private toDetail(row: CarePlanDetailRow) {
    const { tasks, questions, ...rest } = row;

    return {
      ...this.toListItem(rest),
      icd_codes: rest.icd_codes.map(
        ({ icdcode }) =>
          `${icdcode.id}: ${icdcode.code} - ${icdcode.description}`,
      ),
      section_order: [...new Set(questions.map((q) => q.type).filter(Boolean))],
      careplan_task: tasks.length ? tasks : undefined,
    };
  }

  private buildResponse(isExist: boolean) {
    return { message: isExist ? TITLE_EXISTS : TITLE_AVAILABLE, isExist };
  }
}
