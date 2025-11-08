import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BasketEntity } from '../basket/entity/basket.entity';
import { PaymentEntity } from './entity/payment.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { BasketService } from '../basket/basket.service';
import { ProductModule } from '../product/product.module';
import { DiscountModule } from '../discount/discount.module';
import { HttpApiModule } from '../http/http.module';
import { OrderEntity } from '../order/entity/order.entity';
import { OrderItemsEntity } from '../order/entity/order-items.entity';

@Module({
  imports: [
    ProductModule,
    DiscountModule,
    HttpApiModule,
    TypeOrmModule.forFeature([
      PaymentEntity,
      BasketEntity,
      OrderEntity,
      OrderItemsEntity,
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, BasketService],
})
export class PaymentModule {}
