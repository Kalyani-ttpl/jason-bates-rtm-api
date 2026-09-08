import { Module } from "@nestjs/common";
import { ProvidergroupController } from "./providergroup.controller";
import { ProvidergroupService } from "./providergroup.service";

@Module({
  controllers: [ProvidergroupController],
  providers: [ProvidergroupService],
  exports: [ProvidergroupService],
})
export class ProvidergroupModule {}
