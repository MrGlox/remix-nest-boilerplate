import { Module } from "@nestjs/common";
import { PrismaService } from "../../../../database/prisma.service"; // Import PrismaService
import { UserRepository } from "../user.repository";
import { UsersRelationalRepository } from "./repositories/user.repository";

@Module({
  providers: [
    PrismaService, // Add PrismaService to providers
    {
      provide: UserRepository,
      useClass: UsersRelationalRepository,
    },
  ],
  exports: [UserRepository],
})
export class RelationalUserPersistenceModule {}
