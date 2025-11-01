import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { ProductDetailEntity } from './product-detail.entity';
import { ProductColorEntity } from './product-color.entity';
import { ProductSizeEntity } from './product-size.entity';
import { ProductType } from '../enum/type.enum';
import { BasketEntity } from '../../basket/entity/basket.entity';

@Entity()
export class ProductEntity extends BaseEntity {
  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  slug: string;

  @Column()
  code: string;

  @Column({ type: 'enum', enum: ProductType })
  type: ProductType;

  @Column({ default: 0 })
  count: number;

  @Column({ type: 'decimal', nullable: true })
  price: number;

  @Column({ type: 'decimal', nullable: true, default: 0 })
  discount: number;

  @Column({ default: false })
  active_discount: boolean;

  @OneToMany(() => ProductDetailEntity, (detail) => detail.product)
  details: ProductDetailEntity[];

  @OneToMany(() => ProductColorEntity, (color) => color.product)
  colors: ProductColorEntity[];

  @OneToMany(() => ProductSizeEntity, (size) => size.product)
  sizes: ProductSizeEntity[];

  @OneToMany(() => BasketEntity, (basket) => basket.product)
  baskets: BasketEntity[];
}
