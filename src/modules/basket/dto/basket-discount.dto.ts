import { ApiProperty } from '@nestjs/swagger';

export class AddDiscountToBasketDto {
  @ApiProperty()
  basketId: number;

  @ApiProperty()
  code: string;
}
