import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entity/order.entity';
import { OrderItemsEntity } from './entity/order-items.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderItemsEntity])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
