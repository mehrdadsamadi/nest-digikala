import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { DiscountType } from '../type.enum';

@Entity()
export class DiscountEntity extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column({ type: 'decimal', nullable: true })
  percent: number;

  @Column({ type: 'decimal', nullable: true })
  amount: number;

  @Column({ nullable: true })
  limit: number;

  @Column({ default: 0 })
  usage: number;

  @Column({ type: 'timestamp', nullable: true })
  expires_in: Date;

  @Column({ nullable: true })
  productId: number;

  @Column({ type: 'enum', enum: DiscountType })
  type: DiscountType;
}
