import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { ProductEntity } from './product.entity';
import { BasketEntity } from '../../basket/entity/basket.entity';
import { OrderItemsEntity } from '../../order/entity/order-items.entity';

@Entity()
export class ProductSizeEntity extends BaseEntity {
  @Column()
  productId: number;

  @Column()
  size: string;

  @Column()
  count: number;

  @Column({ type: 'decimal' })
  price: number;

  @Column({ type: 'decimal', default: 0 })
  discount: number;

  @Column({ default: false })
  active_discount: boolean;

  @ManyToOne(() => ProductEntity, (product) => product.sizes, {
    onDelete: 'CASCADE',
  })
  product: ProductEntity;

  @OneToMany(() => BasketEntity, (basket) => basket.product)
  baskets: BasketEntity[];

  @OneToMany(() => OrderItemsEntity, (orderItems) => orderItems.size)
  orders: OrderItemsEntity[];
}
