import { Module } from "@nestjs/common";
import { CareplanController } from "./careplan.controller";
import { CareplanService } from "./careplan.service";

@Module({
  controllers: [CareplanController],
  providers: [CareplanService],
  exports: [CareplanService],
})
export class CareplanModule {}
