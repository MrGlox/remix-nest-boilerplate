import { Module } from "@nestjs/common";
import { PrismaService } from "../../../../database/prisma.service"; // Import PrismaService
import { SessionRepository } from "../session.repository";
import { SessionRelationalRepository } from "./repositories/session.repository";

@Module({
  providers: [
    PrismaService, // Add PrismaService to providers
    {
      provide: SessionRepository,
      useClass: SessionRelationalRepository,
    },
  ],
  exports: [SessionRepository],
})
export class RelationalSessionPersistenceModule {}
