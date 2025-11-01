import { Module } from '@nestjs/common';
import { BasketController } from './basket.controller';
import { BasketService } from './basket.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BasketEntity } from './entity/basket.entity';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [ProductModule, TypeOrmModule.forFeature([BasketEntity])],
  controllers: [BasketController],
  providers: [BasketService],
})
export class BasketModule {}
