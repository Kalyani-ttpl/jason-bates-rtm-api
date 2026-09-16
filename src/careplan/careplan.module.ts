import { Module } from "@nestjs/common";
import { CarePlanQuestionController } from "./careplan-question.controller";
import { CareplanController } from "./careplan.controller";
import { CareplanService } from "./careplan.service";
import { CommonQuestionController } from "./common-question.controller";
import { CommonQuestionService } from "./common-question.service";

@Module({
  controllers: [
    CareplanController,
    CarePlanQuestionController,
    CommonQuestionController,
  ],
  providers: [CareplanService, CommonQuestionService],
  exports: [CareplanService, CommonQuestionService],
})
export class CareplanModule {}
