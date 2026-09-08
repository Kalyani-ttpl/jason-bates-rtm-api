import { Injectable } from "@nestjs/common";
import { BaseService } from "../common/base.service";
import { PrismaService } from "../prisma/prisma.service";
import { CheckCarePlanDto } from "./dto/careplan.dto";

const TITLE_EXISTS = "Care Plan already exist with same name";
const TITLE_AVAILABLE = "Care Plan with this name does not exist";
const NOT_FOUND = "Care-Plan not found";

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
        const existing = await prisma.careplan.findUnique({ where: { id } });
        this.throwNotFoundError(existing, NOT_FOUND);

        const duplicate = await prisma.careplan.findFirst({
          where: {
            title: { equals: payload.title, mode: "insensitive" },
            NOT: { id },
          },
        });
        return this.buildResponse(duplicate !== null);
      }

      const duplicate = await prisma.careplan.findFirst({
        where: { title: { equals: payload.title, mode: "insensitive" } },
      });
      return this.buildResponse(duplicate !== null);
    } catch (error) {
      this.handleError(error, "Failed to check care plan");
    }
  }

  private buildResponse(isExist: boolean) {
    return { message: isExist ? TITLE_EXISTS : TITLE_AVAILABLE, isExist };
  }
}
