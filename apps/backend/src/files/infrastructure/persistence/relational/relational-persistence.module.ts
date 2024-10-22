import { Module } from "@nestjs/common";

import { FileRelationalRepository } from "./repositories/file.repository";

import { PrismaService } from "../../../../database/prisma.service"; // Import PrismaService
import { FileRepository } from "../file.repository";

@Module({
  providers: [
    PrismaService, // Add PrismaService to providers
    {
      provide: FileRepository,
      useClass: FileRelationalRepository,
    },
  ],
  exports: [FileRepository],
})
export class RelationalFilePersistenceModule {}
