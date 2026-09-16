import { Injectable } from "@nestjs/common";
import { BaseService } from "../common/base.service";
import { QType } from "../common/constants";
import { PrismaService } from "../prisma/prisma.service";
import { QueryCommonQuestionsDto } from "./dto/common-question.dto";

/** The frontend sends these aliases; the column only ever holds the target. */
const TYPE_ALIASES: Record<string, QType> = {
  [QType.GeneralQuestions]: QType.General,
  [QType.Support]: QType.Supports,
  [QType.SupportQuestions]: QType.Supports,
};

@Injectable()
export class CommonQuestionService extends BaseService {
  constructor(private readonly prisma: PrismaService) {
    super(CommonQuestionService.name);
  }

  /**
   * Lists the common questions shared by every care plan, filtered by type
   * when one is given. Unknown types simply match nothing, as in Zenara.
   */
  async findAll(param: QueryCommonQuestionsDto) {
    try {
      const type = param.type && (TYPE_ALIASES[param.type] ?? param.type);

      return await this.prisma.commonQuestion.findMany({
        where: { ...(type && { type }) },
        orderBy: { id: "asc" },
      });
    } catch (error) {
      this.handleError(error, "Failed to fetch common questions");
    }
  }
}
