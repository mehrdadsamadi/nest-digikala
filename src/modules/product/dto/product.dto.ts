import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ProductType } from '../enum/type.enum';

export class CreateProductDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  count: number;

  @ApiProperty({ enum: ProductType })
  type: ProductType;

  @ApiPropertyOptional()
  price: number;

  @ApiPropertyOptional()
  discount: number;

  @ApiPropertyOptional({ type: Boolean, default: false })
  active_discount: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
