import { Module } from "@nestjs/common";
import { DataimportController } from "./dataimport.controller";
import { DataimportService } from "./dataimport.service";

@Module({
  controllers: [DataimportController],
  providers: [DataimportService],
  exports: [DataimportService],
})
export class DataimportModule {}
