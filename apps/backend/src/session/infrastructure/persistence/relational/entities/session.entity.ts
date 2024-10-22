import { ApiProperty } from "@nestjs/swagger";

import { UserEntity } from "../../../../../users/infrastructure/persistence/relational/entities/user.entity";
import { EntityRelationalHelper } from "../../../../../utils/relational-entity-helper";

export class SessionEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: UserEntity,
  })
  user: UserEntity;

  @ApiProperty({
    type: String,
  })
  hash: string;

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
}
