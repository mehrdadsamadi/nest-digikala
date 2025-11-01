import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './modules/product/product.module';
import { DiscountModule } from './modules/discount/discount.module';

@Module({
  imports: [
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
