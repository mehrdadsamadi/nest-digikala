import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { ProductEntity } from './product.entity';
import { BasketEntity } from '../../basket/entity/basket.entity';

@Entity()
export class ProductColorEntity extends BaseEntity {
  @Column()
  productId: number;

  @Column()
  color_name: string;

  @Column()
  color_code: string;

  @Column()
  count: number;

  @Column({ type: 'decimal' })
  price: number;

  @Column({ type: 'decimal', default: 0 })
  discount: number;

  @Column({ default: false })
  active_discount: boolean;

  @ManyToOne(() => ProductEntity, (product) => product.colors, {
    onDelete: 'CASCADE',
  })
  product: ProductEntity;

  @OneToMany(() => BasketEntity, (basket) => basket.product)
  baskets: BasketEntity[];
}
