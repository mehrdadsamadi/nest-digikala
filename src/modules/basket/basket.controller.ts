import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BasketService } from './basket.service';

@Controller('basket')
@ApiTags('Basket')
export class BasketController {
  constructor(private basketService: BasketService) {}

  @Get()
  basket() {}

  @Post('/add')
  addToBasket() {}

  @Post('/add-discount')
  addDiscountToBasket() {}

  @Post('/remove')
  removeFromBasket() {}

  @Post('/remove-discount')
  removeDiscountFromBasket() {}
}
