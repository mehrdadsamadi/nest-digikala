import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ProductModule } from './modules/product/product.module';
import { DiscountModule } from './modules/discount/discount.module';
import { BasketModule } from './modules/basket/basket.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '۱۳۷۹',
      database: 'digikala',
      synchronize: true,
      autoLoadEntities: false,
      entities: [
        'dist/**/**/**/*.entity{.ts,.js}',
        'dist/**/**/*.entity{.ts,.js}',
      ],
    }),
    ProductModule,
    DiscountModule,
    BasketModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
