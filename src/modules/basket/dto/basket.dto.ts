import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToBasketDto {
  @ApiProperty()
  productId: number;

  @ApiPropertyOptional()
  colorId: number;

  @ApiPropertyOptional()
  sizeId: number;
}
