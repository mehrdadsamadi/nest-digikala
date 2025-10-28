import { ApiProperty, PartialType } from '@nestjs/swagger';

export class AddDetailDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  value: string;

  @ApiProperty()
  productId: number;
}

export class UpdateDetailDto extends PartialType(AddDetailDto) {}
