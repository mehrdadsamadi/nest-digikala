import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { ProductEntity } from '../../product/entities/product.entity';
import { ProductColorEntity } from '../../product/entities/product-color.entity';
import { ProductSizeEntity } from '../../product/entities/product-size.entity';
import { DiscountEntity } from '../../discount/entity/discount.entity';

@Entity()
export class BasketEntity extends BaseEntity {
  @Column({ nullable: true })
  productId: number;

  @Column({ nullable: true })
  sizeId: number;

  @Column({ nullable: true })
  colorId: number;

  @Column({ nullable: true })
  discountId: number;

  @Column()
  count: number;

  @ManyToOne(() => ProductEntity, (product) => product.baskets, {
    onDelete: 'CASCADE',
  })
  product: ProductEntity;

  @ManyToOne(() => ProductColorEntity, (color) => color.baskets, {
    onDelete: 'CASCADE',
  })
  color: ProductColorEntity;

  @ManyToOne(() => ProductSizeEntity, (size) => size.baskets, {
    onDelete: 'CASCADE',
  })
  size: ProductSizeEntity;

  @ManyToOne(() => DiscountEntity, (discount) => discount.baskets, {
    onDelete: 'CASCADE',
  })
  discount: DiscountEntity;
}
