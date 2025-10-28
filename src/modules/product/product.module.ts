import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { ProductDetailEntity } from './entities/product-detail.entity';
import { ProductSizeEntity } from './entities/product-size.entity';
import { ProductColorEntity } from './entities/product-color.entity';
import { ProductController } from './controller/product.controller';
import { ProductSizeController } from './controller/product-size.controller';
import { ProductColorController } from './controller/product-color.controller';
import { ProductDetailController } from './controller/product-detail.controller';
import { ProductService } from './product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ProductDetailEntity,
      ProductSizeEntity,
      ProductColorEntity,
    ]),
  ],
  controllers: [
    ProductController,
    ProductSizeController,
    ProductColorController,
    ProductDetailController,
  ],
  providers: [ProductService],
})
export class ProductModule {}
