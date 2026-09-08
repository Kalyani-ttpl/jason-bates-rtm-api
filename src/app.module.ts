import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { CareplanModule } from "./careplan/careplan.module";
import { LibraryModule } from "./library/library.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProvidergroupModule } from "./providergroup/providergroup.module";
import { ProvidersModule } from "./providers/providers.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{ name: "auth", ttl: 60000, limit: 100 }],
    }),
    PrismaModule,
    AuthModule,
    LibraryModule,
    CareplanModule,
    ProvidergroupModule,
    ProvidersModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
