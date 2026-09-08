import { Module } from "@nestjs/common";
import { ConditionController } from "./condition.controller";
import { ConditionService } from "./condition.service";
import { ConsentController } from "./consent.controller";
import { ConsentService } from "./consent.service";
import { CptCodeController } from "./cpt-code.controller";
import { CptCodeService } from "./cpt-code.service";
import { IcdCodeController } from "./icd-code.controller";
import { IcdCodeService } from "./icd-code.service";
import { TaskTypeController } from "./task-type.controller";
import { TaskTypeService } from "./task-type.service";
import { TemplateController } from "./template.controller";
import { TemplateService } from "./template.service";

@Module({
  controllers: [
    IcdCodeController,
    CptCodeController,
    ConditionController,
    TaskTypeController,
    TemplateController,
    ConsentController,
  ],
  providers: [
    IcdCodeService,
    CptCodeService,
    ConditionService,
    TaskTypeService,
    TemplateService,
    ConsentService,
  ],
  exports: [
    IcdCodeService,
    CptCodeService,
    ConditionService,
    TaskTypeService,
    TemplateService,
    ConsentService,
  ],
})
export class LibraryModule {}
