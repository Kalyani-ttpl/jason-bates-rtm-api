import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AssessmentsModule } from "./assessments/assessments.module";
import { AuthModule } from "./auth/auth.module";
import { CareplanModule } from "./careplan/careplan.module";
import { DataimportModule } from "./dataimport/dataimport.module";
import { EducationModule } from "./education/education.module";
import { LibraryModule } from "./library/library.module";
import { PatientChartingModule } from "./patient-charting/patient-charting.module";
import { PatientsModule } from "./patients/patients.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProvidergroupModule } from "./providergroup/providergroup.module";
import { ProvidersModule } from "./providers/providers.module";
import { TasksModule } from "./tasks/tasks.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{ name: "auth", ttl: 60000, limit: 100 }],
    }),
    PrismaModule,
    AuthModule,
    AssessmentsModule,
    LibraryModule,
    CareplanModule,
    DataimportModule,
    EducationModule,
    PatientsModule,
    PatientChartingModule,
    ProvidergroupModule,
    ProvidersModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
