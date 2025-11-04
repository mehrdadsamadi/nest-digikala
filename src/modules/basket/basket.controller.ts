import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { BasketService } from './basket.service';
import { BasketDto } from './dto/basket.dto';
import { AddDiscountToBasketDto } from './dto/basket-discount.dto';

@Controller('basket')
@ApiTags('Basket')
export class BasketController {
  constructor(private basketService: BasketService) {}

  @Get()
  basket() {
    return this.basketService.getBasket();
  }

  @Post('/add')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  addToBasket(@Body() basketDto: BasketDto) {
    return this.basketService.addToBasket(basketDto);
  }

  @Post('/add-discount')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  addDiscountToBasket(@Body() discountDto: AddDiscountToBasketDto) {
    return this.basketService.addDiscountToBasket(discountDto);
  }

  @Delete('/remove')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  removeFromBasket(@Body() basketDto: BasketDto) {
    return this.basketService.removeFromBasket(basketDto);
  }

  @Delete('/remove/:id')
  removeFromBasketById(@Param('id', ParseIntPipe) id: number) {
    return this.basketService.removeFromBasketById(id);
  }

  @Delete('/remove-discount')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  removeDiscountFromBasket(@Body() discountDto: AddDiscountToBasketDto) {
    return this.basketService.removeDiscountFromBasket(discountDto);
  }
}
