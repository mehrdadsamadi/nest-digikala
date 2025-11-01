import { Module } from '@nestjs/common';
import { BasketController } from './basket.controller';
import { BasketService } from './basket.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BasketEntity } from './entity/basket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BasketEntity])],
  controllers: [BasketController],
  providers: [BasketService],
})
export class BasketModule {}
