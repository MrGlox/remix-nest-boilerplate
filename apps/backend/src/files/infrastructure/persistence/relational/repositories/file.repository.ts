import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../../database/prisma.service"; // Import PrismaService
import { FileRepository } from "../../file.repository";

import { NullableType } from "../../../../../utils/types/nullable.type";
import { FileType } from "../../../../domain/file";
import { FileMapper } from "../mappers/file.mapper";

@Injectable()
export class FileRelationalRepository implements FileRepository {
  constructor(private readonly prisma: PrismaService) {} // Inject PrismaService

  async create(data: FileType): Promise<FileType> {
    const persistenceModel = FileMapper.toPersistence(data);
    return this.prisma.file.create({ data: persistenceModel }); // Use Prisma to create
  }

  async findById(id: FileType["id"]): Promise<NullableType<FileType>> {
    const entity = await this.prisma.file.findUnique({
      where: { id: id },
    });

    return entity ? FileMapper.toDomain(entity) : null;
  }
}
