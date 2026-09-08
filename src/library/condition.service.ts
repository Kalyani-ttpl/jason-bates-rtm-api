import { BadRequestException, Injectable } from "@nestjs/common";
import { BaseService } from "../common/base.service";
import { PrismaService } from "../prisma/prisma.service";
import {
  CopyQuestionariesDto,
  CreateConditionDto,
  CreateConditionQuestionsDto,
  QueryConditionsDto,
  UpdateConditionDto,
  UpdateConditionQuestionDto,
} from "./dto/condition.dto";

@Injectable()
export class ConditionService extends BaseService {
  constructor(private readonly prisma: PrismaService) {
    super(ConditionService.name);
  }

  /** Creates a condition and links the supplied ICD codes to it. */
  async create(data: CreateConditionDto) {
    try {
      const { icd_codes = [], ...conditionData } = data;

      const existing = await this.prisma.condition.findFirst({
        where: { title: data.title },
      });
      if (existing) {
        throw new BadRequestException(
          `Condition '${data.title}' already exists`,
        );
      }

      return await this.prisma.$transaction(async (tx) => {
        const condition = await tx.condition.create({
          data: conditionData,
        });

        if (icd_codes.length) {
          await tx.icd_code.updateMany({
            where: { id: { in: icd_codes.map((id) => BigInt(id)) } },
            data: { condition_id: condition.id },
          });
        }

        return tx.condition.findUnique({
          where: { id: condition.id },
          include: { icd_codes: true },
        });
      });
    } catch (error) {
      this.handleError(error, "Failed to create condition");
    }
  }

  /** Returns a paginated list of conditions, optionally filtered by program. */
  async findAll(param: QueryConditionsDto) {
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
        ...(param.program && { [`for_${param.program}`]: true }),
        ...(param.search && {
          OR: [
            { title: { contains: param.search, mode: "insensitive" as const } },
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
        prisma.condition.findMany({
          where,
          take: pageSize,
          skip: (pageNo - 1) * pageSize,
          orderBy: { [sortBy]: orderBy },
          include: { _count: { select: { questions: true, icd_codes: true } } },
        }),
        prisma.condition.count({ where }),
      ]);

      const totalPages = Math.ceil(count / pageSize);
      return {
        count,
        next: pageNo < totalPages ? pageNo + 1 : null,
        previous: pageNo > 1 ? pageNo - 1 : null,
        results: rows,
      };
    } catch (error) {
      this.handleError(error, "Failed to fetch conditions");
    }
  }

  async findOne(id: bigint) {
    try {
      const condition = await this.prisma.condition.findUnique({
        where: { id },
        include: { questions: true, icd_codes: true },
      });
      this.throwNotFoundError(condition, `Condition with id '${id}' not found`);

      return condition;
    } catch (error) {
      this.handleError(error, "Failed to fetch condition");
    }
  }

  async update(id: bigint, data: UpdateConditionDto) {
    try {
      const { icd_codes, ...conditionData } = data;

      const existing = await this.prisma.condition.findUnique({
        where: { id },
      });
      this.throwNotFoundError(existing, `Condition with id '${id}' not found`);

      if (data.title) {
        const duplicate = await this.prisma.condition.findFirst({
          where: { title: data.title, NOT: { id } },
        });
        if (duplicate) {
          throw new BadRequestException(
            `Condition '${data.title}' already exists`,
          );
        }
      }

      return await this.prisma.$transaction(async (tx) => {
        await tx.condition.update({ where: { id }, data: conditionData });

        if (icd_codes) {
          await tx.icd_code.updateMany({
            where: { condition_id: id },
            data: { condition_id: null },
          });
          if (icd_codes.length) {
            await tx.icd_code.updateMany({
              where: { id: { in: icd_codes.map((c) => BigInt(c)) } },
              data: { condition_id: id },
            });
          }
        }

        return tx.condition.findUnique({
          where: { id },
          include: { questions: true, icd_codes: true },
        });
      });
    } catch (error) {
      this.handleError(error, "Failed to update condition");
    }
  }

  async remove(id: bigint) {
    try {
      const existing = await this.prisma.condition.findUnique({
        where: { id },
      });
      this.throwNotFoundError(existing, `Condition with id '${id}' not found`);

      await this.prisma.$transaction(async (tx) => {
        await tx.icd_code.updateMany({
          where: { condition_id: id },
          data: { condition_id: null },
        });
        await tx.condition.delete({ where: { id } });
      });

      return { detail: "Condition deleted successfully", id };
    } catch (error) {
      this.handleError(error, "Failed to delete condition");
    }
  }

  /** ICD codes linked to a condition. */
  async findIcdCodes(conditionId: bigint) {
    try {
      const condition = await this.prisma.condition.findUnique({
        where: { id: conditionId },
      });
      this.throwNotFoundError(
        condition,
        `Condition with id '${conditionId}' not found`,
      );

      return this.prisma.icd_code.findMany({
        where: { condition_id: conditionId },
        orderBy: { code: "asc" },
      });
    } catch (error) {
      this.handleError(error, "Failed to fetch condition ICD codes");
    }
  }

  async createQuestions(
    conditionId: bigint,
    data: CreateConditionQuestionsDto,
  ) {
    try {
      const condition = await this.prisma.condition.findUnique({
        where: { id: conditionId },
      });
      this.throwNotFoundError(
        condition,
        `Condition with id '${conditionId}' not found`,
      );

      await this.prisma.condition_question.createMany({
        data: data.questions.map((question) => ({
          ...question,
          condition_id: conditionId,
        })),
      });

      return this.findQuestions(conditionId);
    } catch (error) {
      this.handleError(error, "Failed to create condition questions");
    }
  }

  async findQuestions(conditionId: bigint) {
    try {
      return await this.prisma.condition_question.findMany({
        where: { condition_id: conditionId },
        orderBy: { created_at: "asc" },
      });
    } catch (error) {
      this.handleError(error, "Failed to fetch condition questions");
    }
  }

  async updateQuestion(
    conditionId: bigint,
    questionId: bigint,
    data: UpdateConditionQuestionDto,
  ) {
    try {
      const question = await this.prisma.condition_question.findFirst({
        where: { id: questionId, condition_id: conditionId },
      });
      this.throwNotFoundError(
        question,
        `Question with id '${questionId}' not found for this condition`,
      );

      return await this.prisma.condition_question.update({
        where: { id: questionId },
        data,
      });
    } catch (error) {
      this.handleError(error, "Failed to update condition question");
    }
  }

  async removeQuestion(conditionId: bigint, questionId: bigint) {
    try {
      const question = await this.prisma.condition_question.findFirst({
        where: { id: questionId, condition_id: conditionId },
      });
      this.throwNotFoundError(
        question,
        `Question with id '${questionId}' not found for this condition`,
      );

      await this.prisma.condition_question.delete({
        where: { id: questionId },
      });

      return { detail: "Question deleted successfully", id: questionId };
    } catch (error) {
      this.handleError(error, "Failed to delete condition question");
    }
  }

  /** Copies every question from another condition onto this one. */
  async copyQuestions(conditionId: bigint, data: CopyQuestionariesDto) {
    try {
      const sourceId = BigInt(data.source_condition_id);

      if (sourceId === conditionId) {
        throw new BadRequestException(
          "Source and target condition must be different",
        );
      }

      const [target, source] = await Promise.all([
        this.prisma.condition.findUnique({ where: { id: conditionId } }),
        this.prisma.condition.findUnique({ where: { id: sourceId } }),
      ]);
      this.throwNotFoundError(
        target,
        `Condition with id '${conditionId}' not found`,
      );
      this.throwNotFoundError(
        source,
        `Condition with id '${sourceId}' not found`,
      );

      const questions = await this.prisma.condition_question.findMany({
        where: { condition_id: sourceId },
      });

      if (questions.length) {
        await this.prisma.condition_question.createMany({
          data: questions.map((question) => ({
            condition_id: conditionId,
            title: question.title,
            question_type: question.question_type,
            choices: question.choices,
            additional_note: question.additional_note,
          })),
        });
      }

      return this.findQuestions(conditionId);
    } catch (error) {
      this.handleError(error, "Failed to copy condition questions");
    }
  }
}
