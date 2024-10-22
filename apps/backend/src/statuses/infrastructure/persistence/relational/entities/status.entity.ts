import { ApiProperty } from "@nestjs/swagger";

export class StatusEntity {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: String,
    example: "active",
  })
  name?: string;
}
