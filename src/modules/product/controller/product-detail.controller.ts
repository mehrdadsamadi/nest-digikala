import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AddDetailDto, UpdateDetailDto } from '../dto/detail.dto';

@Controller('product-detail')
@ApiTags('Product-detail')
export class ProductDetailController {
  constructor() {}

  @Post()
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  create(@Body() detailDto: AddDetailDto) {}

  @Get()
  find() {}

  @Put('/:id')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() detailDto: UpdateDetailDto,
  ) {}

  @Delete('/:id')
  delete(@Param('id', ParseIntPipe) id: number) {}
}
