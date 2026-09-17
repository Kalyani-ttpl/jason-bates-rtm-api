import { BaseService } from "../common/base.service";
import { PrismaService } from "../prisma/prisma.service";
import { ChartingQueryDto } from "./dto/charting.dto";

export const PATIENT_NOT_FOUND = "Patient not found";

export interface Page {
  skip: number;
  take: number;
  pageNo: number;
  pageSize: number;
  orderBy: Record<string, unknown>;
}

/**
 * Shared plumbing for the charting tabs. Every tab paginates, sorts and hides
 * soft-deleted rows the same way, so that lives here rather than five times over.
 */
export abstract class ChartingBaseService extends BaseService {
  constructor(
    protected readonly prisma: PrismaService,
    context: string,
  ) {
    super(context);
  }

  /** Every tab is scoped to a patient, so a bad id must 404 before querying. */
  protected async assertPatient(patientId: bigint) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true },
    });
    this.throwNotFoundError(patient, PATIENT_NOT_FOUND);
  }

  protected page(
    param: ChartingQueryDto,
    sortFields: Record<string, string>,
    fallback: string,
  ): Page {
    const pageNo = Math.max(Number(param.page_no) || 1, 1);
    const pageSize = Math.min(Math.max(Number(param.page_size) || 10, 1), 100);
    const sortBy =
      sortFields[param.sort_by ?? fallback] ?? sortFields[fallback];

    return {
      skip: (pageNo - 1) * pageSize,
      take: pageSize,
      pageNo,
      pageSize,
      orderBy: { [sortBy]: param.order_by ?? "desc" },
    };
  }

  protected envelope<T>(rows: T[], count: number, page: Page) {
    const totalPages = Math.ceil(count / page.pageSize);
    return {
      count,
      next: page.pageNo < totalPages ? page.pageNo + 1 : null,
      previous: page.pageNo > 1 ? page.pageNo - 1 : null,
      results: rows,
    };
  }

  protected toDate(value?: string): Date | null {
    return value ? new Date(value) : null;
  }
}
