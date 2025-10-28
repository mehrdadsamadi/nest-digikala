import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { ProductEntity } from './product.entity';

@Entity()
export class ProductDetailEntity extends BaseEntity {
  @Column()
  productId: number;

  @Column()
  key: string;

  @Column()
  value: string;

  @ManyToOne(() => ProductEntity, (product) => product.details, {
    onDelete: 'CASCADE',
  })
  product: ProductEntity;
}
