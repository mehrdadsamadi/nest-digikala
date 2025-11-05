import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { OrderStatus } from '../enum/order-status.enum';
import { OrderItemsEntity } from './order-items.entity';
import { PaymentEntity } from '../../payment/entity/payment.entity';

@Entity()
export class OrderEntity extends BaseEntity {
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column()
  address: string;

  @Column({ nullable: true })
  paymentId: number;

  @Column()
  final_amount: number;

  @Column()
  discount_amount: number;

  @Column()
  total_amount: number;

  @OneToMany(() => OrderItemsEntity, (orderItem) => orderItem.order, {
    onDelete: 'CASCADE',
  })
  items: OrderItemsEntity[];

  @OneToOne(() => PaymentEntity, (payment) => payment.order, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  payment: PaymentEntity;
}
