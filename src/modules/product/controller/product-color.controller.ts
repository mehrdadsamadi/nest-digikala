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
import { AddColorDto, UpdateColorDto } from '../dto/color.dto';

@Controller('product-color')
@ApiTags('Product-color')
export class ProductColorController {
  constructor() {}

  @Post()
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  create(@Body() colorDto: AddColorDto) {}

  @Get()
  find() {}

  @Put('/:id')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() colorDto: UpdateColorDto,
  ) {}

  @Delete('/:id')
  delete(@Param('id', ParseIntPipe) id: number) {}
}
