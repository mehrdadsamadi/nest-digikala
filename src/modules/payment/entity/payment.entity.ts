import { Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { OrderEntity } from '../../order/entity/order.entity';

@Entity()
export class PaymentEntity extends BaseEntity {
  @Column()
  amount: number;

  @Column({ default: false })
  status: boolean;

  @Column()
  invoice_number: string;

  @Column()
  orderId: number;

  @Column({ nullable: true })
  refId: string;

  @Column({ nullable: true })
  authority: string;

  @OneToOne(() => OrderEntity, (order) => order.payment, {
    onDelete: 'CASCADE',
  })
  order: OrderEntity;
}
