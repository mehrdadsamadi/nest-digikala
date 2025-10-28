import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class AddSizeDto {
  @ApiProperty()
  size: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  productId: number;

  @ApiProperty()
  price: number;

  @ApiPropertyOptional()
  discount: number;

  @ApiPropertyOptional({ type: Boolean })
  active_discount: boolean;
}

export class UpdateSizeDto extends PartialType(AddSizeDto) {}
