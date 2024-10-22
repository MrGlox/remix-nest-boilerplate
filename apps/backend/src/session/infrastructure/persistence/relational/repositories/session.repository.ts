import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../../database/prisma.service"; // Import PrismaService
import { NullableType } from "../../../../../utils/types/nullable.type";

import { Session } from "../../../../domain/session";
import { SessionRepository } from "../../session.repository";

import { User } from "../../../../../users/domain/user";
import { SessionMapper } from "../mappers/session.mapper";

@Injectable()
export class SessionRelationalRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {} // Inject PrismaService

  async findById(id: Session["id"]): Promise<NullableType<Session>> {
    const entity = await this.prisma.session.findUnique({
      where: { id: Number(id) },
    });

    return entity ? SessionMapper.toDomain(entity) : null;
  }

  async create(data: Session): Promise<Session> {
    const persistenceModel = SessionMapper.toPersistence(data);
    const createdEntity = await this.prisma.session.create({
      data: persistenceModel,
    });
    return SessionMapper.toDomain(createdEntity);
  }

  async update(
    id: Session["id"],
    payload: Partial<
      Omit<Session, "id" | "createdAt" | "updatedAt" | "deletedAt">
    >
  ): Promise<Session | null> {
    const entity = await this.prisma.session.findUnique({
      where: { id: Number(id) },
    });

    if (!entity) {
      throw new Error("Session not found");
    }

    const updatedEntity = await this.prisma.session.update({
      where: { id: Number(id) },
      data: SessionMapper.toPersistence({
        ...SessionMapper.toDomain(entity),
        ...payload,
      }),
    });

    return SessionMapper.toDomain(updatedEntity);
  }

  async deleteById(id: Session["id"]): Promise<void> {
    await this.prisma.session.delete({
      where: { id: Number(id) },
    });
  }

  async deleteByUserId(conditions: { userId: User["id"] }): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { userId: Number(conditions.userId) },
    });
  }

  async deleteByUserIdWithExclude(conditions: {
    userId: User["id"];
    excludeSessionId: Session["id"];
  }): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        userId: Number(conditions.userId),
        id: { not: Number(conditions.excludeSessionId) },
      },
    });
  }
}
