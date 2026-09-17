import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { BaseService } from "../common/base.service";
import { AuthenticatedUser } from "../common/constants";
import { PrismaService } from "../prisma/prisma.service";
import {
  AssessmentQuestionDto,
  CopyAssessmentDto,
  CreateAssessmentDto,
  QueryAssessmentsDto,
  UpdateAssessmentDto,
} from "./dto/assessment.dto";

const NOT_FOUND = "Assessment not found";
const TITLE_EXISTS = "Assessment already exists with same name";

const SORT_FIELDS: Record<string, string> = {
  id: "id",
  title: "title",
  category: "category",
  created_at: "created_at",
  updated_at: "updated_at",
};

const LIST_INCLUDE = {
  conditions: {
    select: {
      condition: { select: { id: true, title: true, description: true } },
    },
  },
  creator: {
    select: { id: true, email: true, first_name: true, last_name: true },
  },
} satisfies Prisma.AssessmentInclude;

type AssessmentRow = Prisma.AssessmentGetPayload<{
  include: typeof LIST_INCLUDE;
}>;

/** A question with its choices, each of which may branch into more questions. */
export interface QuestionNode {
  id: bigint;
  uuid: string;
  title: string;
  description: string | null;
  type: string;
  choices: ChoiceNode[];
}

export interface ChoiceNode {
  id: bigint;
  uuid: string;
  title: string;
  nas_class: string | null;
  is_free_text: boolean | null;
  questions: QuestionNode[];
}

@Injectable()
export class AssessmentsService extends BaseService {
  constructor(private readonly prisma: PrismaService) {
    super(AssessmentsService.name);
  }

  /** Paginated, searchable and filterable assessment list. */
  async findAll(param: QueryAssessmentsDto) {
    try {
      const pageNo = Math.max(Number(param.page_no) || 1, 1);
      const pageSize = Math.min(
        Math.max(Number(param.page_size) || 15, 1),
        100,
      );
      const sortBy = SORT_FIELDS[param.sort_by ?? "created_at"] ?? "created_at";

      const where: Prisma.AssessmentWhereInput = {
        is_archieved: false,
        ...(param.category && { category: param.category }),
        ...(param.group_id && { provider_group_id: BigInt(param.group_id) }),
        ...(param.search && {
          OR: [
            { title: { contains: param.search, mode: "insensitive" } },
            { description: { contains: param.search, mode: "insensitive" } },
          ],
        }),
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
        this.prisma.assessment.findMany({
          where,
          include: LIST_INCLUDE,
          take: pageSize,
          skip: (pageNo - 1) * pageSize,
          orderBy: { [sortBy]: param.order_by ?? "desc" },
        }),
        this.prisma.assessment.count({ where }),
      ]);

      const totalPages = Math.ceil(count / pageSize);
      return {
        count,
        next: pageNo < totalPages ? pageNo + 1 : null,
        previous: pageNo > 1 ? pageNo - 1 : null,
        results: rows.map((row) => this.toResponse(row)),
      };
    } catch (error) {
      this.handleError(error, "Failed to fetch assessments");
    }
  }

  /** One assessment with its conditions, creator and full question tree. */
  async findOne(id: bigint) {
    try {
      const assessment = await this.prisma.assessment.findUnique({
        where: { id },
        include: LIST_INCLUDE,
      });
      this.throwNotFoundError(assessment, NOT_FOUND);

      return {
        ...this.toResponse(assessment!),
        assessment_questions: await this.questionTree(id),
      };
    } catch (error) {
      this.handleError(error, "Failed to fetch assessment");
    }
  }

  /** The question tree on its own, for the preview screen. */
  async findQuestions(id: bigint) {
    try {
      const assessment = await this.prisma.assessment.findUnique({
        where: { id },
        select: { id: true },
      });
      this.throwNotFoundError(assessment, NOT_FOUND);

      return await this.questionTree(id);
    } catch (error) {
      this.handleError(error, "Failed to fetch assessment questions");
    }
  }

  /** Creates an assessment with its conditions and nested questions. */
  async create(data: CreateAssessmentDto, user: AuthenticatedUser) {
    try {
      await this.assertTitleAvailable(data.title);
      await this.assertConditionsExist(data.conditions);

      const assessment = await this.prisma.$transaction(async (tx) => {
        const created = await tx.assessment.create({
          data: {
            title: data.title,
            description: data.description,
            category: data.category,
            frequencey: data.frequencey,
            flag: data.flag,
            tags: data.tags ?? Prisma.DbNull,
            font_icons: ["Times New Roman"],
            is_nas_assessment: data.is_nas_assessment ?? false,
            is_active: true,
            is_archieved: false,
            creator_id: user.providerId,
            provider_group_id: data.group_id ? BigInt(data.group_id) : null,
          },
        });

        await this.writeConditions(tx, created.id, data.conditions);
        await this.writeQuestions(
          tx,
          created.id,
          null,
          data.assessment_questions,
          user,
        );
        return created;
      });

      return {
        detail: "Assessment created successfully",
        assessment_id: assessment.id,
      };
    } catch (error) {
      this.handleError(error, "Failed to create assessment");
    }
  }

  /**
   * Updates an assessment. Conditions and the whole question tree are replaced
   * when supplied, and left untouched when omitted.
   */
  async update(id: bigint, data: UpdateAssessmentDto, user: AuthenticatedUser) {
    try {
      const existing = await this.prisma.assessment.findUnique({
        where: { id },
      });
      this.throwNotFoundError(existing, NOT_FOUND);

      if (data.title !== undefined && data.title !== existing!.title) {
        await this.assertTitleAvailable(data.title, id);
      }
      await this.assertConditionsExist(data.conditions);

      await this.prisma.$transaction(async (tx) => {
        await tx.assessment.update({
          where: { id },
          data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.description !== undefined && {
              description: data.description,
            }),
            ...(data.category !== undefined && { category: data.category }),
            ...(data.frequencey !== undefined && {
              frequencey: data.frequencey,
            }),
            ...(data.flag !== undefined && { flag: data.flag }),
            ...(data.tags !== undefined && { tags: data.tags }),
            ...(data.is_nas_assessment !== undefined && {
              is_nas_assessment: data.is_nas_assessment,
            }),
            ...(data.is_active !== undefined && { is_active: data.is_active }),
            ...(data.is_archieved !== undefined && {
              is_archieved: data.is_archieved,
            }),
            ...(data.group_id !== undefined && {
              provider_group_id: data.group_id ? BigInt(data.group_id) : null,
            }),
          },
        });

        if (data.conditions) {
          await tx.assessmentCondition.deleteMany({
            where: { assessment_id: id },
          });
          await this.writeConditions(tx, id, data.conditions);
        }

        if (data.assessment_questions) {
          // Deleting the roots cascades through every nested choice and question.
          await tx.assessmentQuestion.deleteMany({
            where: { assessment_id: id, choice_id: null },
          });
          await this.writeQuestions(
            tx,
            id,
            null,
            data.assessment_questions,
            user,
          );
        }
      });

      return { detail: "Assessment updated successfully" };
    } catch (error) {
      this.handleError(error, "Failed to update assessment");
    }
  }

  /** Archives the assessment rather than dropping its responses. */
  async remove(id: bigint) {
    try {
      const existing = await this.prisma.assessment.findUnique({
        where: { id },
      });
      this.throwNotFoundError(existing, NOT_FOUND);

      await this.prisma.assessment.update({
        where: { id },
        data: { is_archieved: true, is_active: false },
      });
      return { detail: "Assessment deleted successfully" };
    } catch (error) {
      this.handleError(error, "Failed to delete assessment");
    }
  }

  /** Duplicates an assessment, its conditions and its whole question tree. */
  async copy(id: bigint, payload: CopyAssessmentDto, user: AuthenticatedUser) {
    try {
      const source = await this.prisma.assessment.findUnique({
        where: { id },
        include: { conditions: { select: { condition_id: true } } },
      });
      this.throwNotFoundError(source, NOT_FOUND);

      const title = await this.uniqueTitle(payload.title);
      const questions = await this.questionTree(id);

      const copy = await this.prisma.$transaction(async (tx) => {
        const created = await tx.assessment.create({
          data: {
            title,
            description: source!.description,
            category: source!.category,
            frequencey: source!.frequencey,
            flag: source!.flag,
            tags: source!.tags ?? Prisma.DbNull,
            font_icons: source!.font_icons ?? Prisma.DbNull,
            is_nas_assessment: source!.is_nas_assessment,
            is_active: true,
            is_archieved: false,
            creator_id: user.providerId,
            provider_group_id: source!.provider_group_id,
          },
        });

        await this.writeConditions(
          tx,
          created.id,
          source!.conditions.map((row) => row.condition_id),
        );
        await this.writeQuestions(tx, created.id, null, questions, user);
        return created;
      });

      return {
        detail: `Assessment copied as ${title}`,
        assessment_id: copy.id,
      };
    } catch (error) {
      this.handleError(error, "Failed to copy assessment");
    }
  }

  /**
   * Loads the whole tree in two flat queries and assembles it in memory. The
   * nesting has no fixed depth, so a nested `include` cannot express it.
   */
  private async questionTree(assessmentId: bigint): Promise<QuestionNode[]> {
    const questions = await this.prisma.assessmentQuestion.findMany({
      where: { assessment_id: assessmentId },
      orderBy: { id: "asc" },
    });
    if (!questions.length) return [];

    const choices = await this.prisma.assessmentQuestionChoice.findMany({
      where: { question_id: { in: questions.map((q) => q.id) } },
      orderBy: { id: "asc" },
    });

    const choicesByQuestion = new Map<bigint, ChoiceNode[]>();
    const questionsByChoice = new Map<bigint, QuestionNode[]>();
    const roots: QuestionNode[] = [];

    const questionNodes = new Map<bigint, QuestionNode>();
    for (const question of questions) {
      const node: QuestionNode = {
        id: question.id,
        uuid: question.uuid,
        title: question.title,
        description: question.description,
        type: question.type,
        choices: [],
      };
      questionNodes.set(question.id, node);

      if (question.choice_id === null) {
        roots.push(node);
      } else {
        const siblings = questionsByChoice.get(question.choice_id) ?? [];
        siblings.push(node);
        questionsByChoice.set(question.choice_id, siblings);
      }
    }

    for (const choice of choices) {
      const node: ChoiceNode = {
        id: choice.id,
        uuid: choice.uuid,
        title: choice.title,
        nas_class: choice.nas_class,
        is_free_text: choice.is_free_text,
        questions: [],
      };
      const siblings = choicesByQuestion.get(choice.question_id) ?? [];
      siblings.push(node);
      choicesByQuestion.set(choice.question_id, siblings);
    }

    // Both maps are complete, so one pass wires every level at once.
    for (const [questionId, node] of questionNodes) {
      node.choices = choicesByQuestion.get(questionId) ?? [];
      for (const choice of node.choices) {
        choice.questions = questionsByChoice.get(choice.id) ?? [];
      }
    }

    return roots;
  }

  /** Inserts questions depth-first; each choice becomes the parent of its own. */
  private async writeQuestions(
    tx: Prisma.TransactionClient,
    assessmentId: bigint,
    choiceId: bigint | null,
    questions: (AssessmentQuestionDto | QuestionNode)[] | undefined,
    user: AuthenticatedUser,
  ) {
    if (!questions?.length) return;

    for (const question of questions) {
      const created = await tx.assessmentQuestion.create({
        data: {
          assessment_id: assessmentId,
          choice_id: choiceId,
          title: question.title,
          description: question.description,
          type: question.type,
          creator_id: user.providerId,
        },
      });

      for (const choice of question.choices ?? []) {
        const createdChoice = await tx.assessmentQuestionChoice.create({
          data: {
            question_id: created.id,
            title: choice.title,
            nas_class: choice.nas_class,
            is_free_text: choice.is_free_text ?? false,
            creator_id: user.providerId,
          },
        });

        await this.writeQuestions(
          tx,
          assessmentId,
          createdChoice.id,
          choice.questions,
          user,
        );
      }
    }
  }

  private async writeConditions(
    tx: Prisma.TransactionClient,
    assessmentId: bigint,
    conditions?: (number | bigint)[],
  ) {
    if (!conditions?.length) return;

    await tx.assessmentCondition.createMany({
      data: conditions.map((id) => ({
        assessment_id: assessmentId,
        condition_id: BigInt(id),
      })),
      skipDuplicates: true,
    });
  }

  /** Names a missing condition rather than letting a foreign key fail. */
  private async assertConditionsExist(conditions?: number[]) {
    if (!conditions?.length) return;

    const ids = conditions.map((id) => BigInt(id));
    const found = await this.prisma.condition.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const missing = ids.filter((id) => !found.some((row) => row.id === id));
    if (missing.length) {
      this.throwBadRequestError(`Condition not found: ${missing.join(", ")}`);
    }
  }

  private async assertTitleAvailable(title: string, excludeId?: bigint) {
    const duplicate = await this.prisma.assessment.findFirst({
      where: {
        title: { equals: title, mode: "insensitive" },
        ...(excludeId && { NOT: { id: excludeId } }),
      },
      select: { id: true },
    });
    if (duplicate) this.throwConflictError(TITLE_EXISTS);
  }

  /** `<title>`, then `(Copy) <title>`, then `(Copy) <title> - n`. */
  private async uniqueTitle(base: string) {
    const taken = async (title: string) =>
      (await this.prisma.assessment.findFirst({
        where: { title: { equals: title, mode: "insensitive" } },
        select: { id: true },
      })) !== null;

    if (!(await taken(base))) return base;
    if (!(await taken(`(Copy) ${base}`))) return `(Copy) ${base}`;

    for (let counter = 1; ; counter += 1) {
      const candidate = `(Copy) ${base} - ${counter}`;
      if (!(await taken(candidate))) return candidate;
    }
  }

  /** Two name parts match first and last name; one part matches either. */
  private creatorNameFilter(
    creatorName?: string,
  ): Prisma.AssessmentWhereInput | undefined {
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

  private toResponse(row: AssessmentRow) {
    const { conditions, ...assessment } = row;
    return {
      ...assessment,
      conditions: conditions.map(({ condition }) => ({
        ...condition,
        value: condition.id,
        label: condition.title,
      })),
    };
  }
}
