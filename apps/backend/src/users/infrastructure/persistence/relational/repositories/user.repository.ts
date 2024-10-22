import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../../database/prisma.service"; // Import PrismaService
import { DeepPartial } from "../../../../../utils/types/deep-partial.type";
import { NullableType } from "../../../../../utils/types/nullable.type";
import { IPaginationOptions } from "../../../../../utils/types/pagination-options";
import { User } from "../../../../domain/user";
import { FilterUserDto, SortUserDto } from "../../../../dto/query-user.dto";
import { UserRepository } from "../../user.repository";
import { UserMapper } from "../mappers/user.mapper";

@Injectable()
export class UsersRelationalRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {} // Inject PrismaService

  findById(id: User["id"]): Promise<NullableType<User>> {
    throw new Error("Method not implemented.");
  }

  findByEmail(email: User["email"]): Promise<NullableType<User>> {
    throw new Error("Method not implemented.");
  }

  findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User["socialId"];
    provider: User["provider"];
  }): Promise<NullableType<User>> {
    throw new Error("Method not implemented.");
  }

  update(id: User["id"], payload: DeepPartial<User>): Promise<User | null> {
    throw new Error("Method not implemented.");
  }

  remove(id: User["id"]): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async create(data: User): Promise<User> {
    const persistenceModel = UserMapper.toPersistence(data);
    const newEntity = await this.prisma.user.create({
      data: persistenceModel,
    });
    return UserMapper.toDomain(newEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions?: IPaginationOptions | null;
  }): Promise<User[]> {
    const where = filterOptions ? this.buildWhereClause(filterOptions) : {};
    const orderBy = sortOptions ? this.buildOrderByClause(sortOptions) : {};

    const users = await this.prisma.user.findMany({
      where,
      orderBy,
      skip: paginationOptions?.skip,
      take: paginationOptions?.take,
    });

    return users.map((user) => UserMapper.toDomain(user as any));
  }

  private buildWhereClause(filterOptions: FilterUserDto): any {
    // Implement your filter logic here
    return {};
  }

  private buildOrderByClause(sortOptions: SortUserDto[]): any {
    // Implement your sort logic here
    return {};
  }
}
