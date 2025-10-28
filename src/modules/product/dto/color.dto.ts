import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class AddColorDto {
  @ApiProperty()
  color_name: string;

  @ApiProperty()
  color_code: string;

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

export class UpdateColorDto extends PartialType(AddColorDto) {}
