import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { OrderEntity } from './order.entity';
import { ProductEntity } from '../../product/entities/product.entity';
import { ProductColorEntity } from '../../product/entities/product-color.entity';
import { ProductSizeEntity } from '../../product/entities/product-size.entity';

@Entity()
export class OrderItemsEntity extends BaseEntity {
  @Column()
  orderId: number;

  @Column()
  productId: number;

  @Column({ nullable: true })
  colorId: number;

  @Column({ nullable: true })
  sizeId: number;

  @Column({ nullable: true })
  count: number;

  @ManyToOne(() => OrderEntity, (order) => order.items)
  order: OrderEntity;

  @ManyToOne(() => ProductEntity, (product) => product.orders)
  product: ProductEntity;

  @ManyToOne(() => ProductColorEntity, (color) => color.orders)
  color: ProductColorEntity;

  @ManyToOne(() => ProductSizeEntity, (size) => size.orders)
  size: ProductSizeEntity;
}
