import { Injectable } from "@nestjs/common";
import { BaseService } from "../common/base.service";
import { QType } from "../common/constants";
import { PrismaService } from "../prisma/prisma.service";
import {
  ALLERGY_QUESTIONS,
  CommonQuestionSeed,
  GENERAL_QUESTIONS,
  MEDICATION_QUESTIONS,
  SUPPORT_QUESTIONS,
} from "./data/common-questions";

const COMMON_QUESTIONS: [QType, CommonQuestionSeed[]][] = [
  [QType.Allergies, ALLERGY_QUESTIONS],
  [QType.Medications, MEDICATION_QUESTIONS],
  [QType.Supports, SUPPORT_QUESTIONS],
  [QType.General, GENERAL_QUESTIONS],
];

export interface ImportResults {
  succeeded: string[];
  failed: { operation: string; error: string }[];
}

@Injectable()
export class DataimportService extends BaseService {
  constructor(private readonly prisma: PrismaService) {
    super(DataimportService.name);
  }

  /**
   * Runs every bootstrap import in sequence, recording which steps succeeded
   * and which failed so one bad step does not abort the rest.
   */
  async importAllData(): Promise<ImportResults> {
    const operations = [
      {
        name: "createCommonCareplanQuestions",
        fn: () => this.createCommonCareplanQuestions(),
      },
    ];

    const results: ImportResults = { succeeded: [], failed: [] };

    for (const operation of operations) {
      try {
        await operation.fn();
        results.succeeded.push(operation.name);
        this.logInfo(`Successfully completed: ${operation.name}`);
      } catch (error) {
        results.failed.push({
          operation: operation.name,
          error: error instanceof Error ? error.message : String(error),
        });
        this.logError(`Failed: ${operation.name}`, error);
      }
    }

    return results;
  }

  /**
   * Inserts the allergy, medication, support and general common questions,
   * skipping any already stored so the import can be re-run safely.
   */
  async createCommonCareplanQuestions(): Promise<void> {
    try {
      for (const [type, questions] of COMMON_QUESTIONS) {
        for (const question of questions) {
          const exists = await this.prisma.commonQuestion.findFirst({
            where: { title: question.title, type },
          });
          if (exists) continue;

          await this.prisma.commonQuestion.create({
            data: {
              type,
              title: question.title,
              choices: question.options,
              question_type: question.question_type,
            },
          });
        }
      }
    } catch (error) {
      this.handleError(error, "Failed to create common careplan questions");
    }
  }
}
