import { FileEntity } from "../../../../../files/infrastructure/persistence/relational/entities/file.entity";
import { StatusEntity } from "../../../../../statuses/infrastructure/persistence/relational/entities/status.entity";

import { ApiProperty } from "@nestjs/swagger";
import { AuthProvidersEnum } from "../../../../../auth/auth-providers.enum";

export class UserEntity {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: String,
    example: "john.doe@example.com",
  })
  email: string;

  @ApiProperty({
    type: String,
    example: "John Doe",
  })
  name: string;

  @ApiProperty({
    type: StatusEntity,
  })
  status: StatusEntity;

  @ApiProperty({
    type: FileEntity,
  })
  avatar: FileEntity;

  @ApiProperty({
    type: String,
    enum: AuthProvidersEnum,
  })
  authProvider: AuthProvidersEnum;

  @ApiProperty({
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
  })
  updatedAt: Date;

  @ApiProperty({
    type: Date,
  })
  deletedAt: Date | null;
  password: string | undefined;
  previousPassword: string | undefined;
  provider: string;
  socialId: string | null | undefined;
  firstName: string | null;
  lastName: string | null;
  photo: any;
  role:
    | import("/Users/mleroux/Web/remix-nest-boilerplate/apps/backend/src/roles/domain/role").Role
    | null
    | undefined;
}
