import { Module } from "@nestjs/common";
import { AllergiesService } from "./allergies.service";
import { ConditionsService } from "./conditions.service";
import { LabResultsService } from "./lab-results.service";
import { MedicationsService } from "./medications.service";
import { PatientChartingController } from "./patient-charting.controller";
import { SymptomsService } from "./symptoms.service";

const services = [
  ConditionsService,
  SymptomsService,
  AllergiesService,
  MedicationsService,
  LabResultsService,
];

@Module({
  controllers: [PatientChartingController],
  providers: services,
  exports: services,
})
export class PatientChartingModule {}
