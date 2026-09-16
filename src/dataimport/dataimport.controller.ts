import { Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { DataimportService } from "./dataimport.service";

@ApiTags("Data Import")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("import-data")
export class DataimportController {
  constructor(private readonly dataimportService: DataimportService) {}

  @Post()
  @ApiOperation({ summary: "Import the master data the app needs to run" })
  async importData() {
    const results = await this.dataimportService.importAllData();

    return {
      detail: results.failed.length
        ? "Data import completed with failures."
        : "Data import completed. All operations completed successfully.",
      succeeded: results.succeeded,
      failed: results.failed,
      summary: {
        total: results.succeeded.length + results.failed.length,
        succeeded: results.succeeded.length,
        failed: results.failed.length,
      },
    };
  }
}
