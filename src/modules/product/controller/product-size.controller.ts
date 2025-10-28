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
import { AddSizeDto, UpdateSizeDto } from '../dto/size.dto';

@Controller('product-size')
@ApiTags('Product-size')
export class ProductSizeController {
  constructor() {}

  @Post()
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  create(@Body() sizeDto: AddSizeDto) {}

  @Get()
  find() {}

  @Put('/:id')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() sizeDto: UpdateSizeDto,
  ) {}

  @Delete('/:id')
  delete(@Param('id', ParseIntPipe) id: number) {}
}
