import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BasketEntity } from './entity/basket.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { BasketDto } from './dto/basket.dto';
import { ProductService } from '../product/service/product.service';
import { ProductType } from '../product/enum/type.enum';
import { ProductColorService } from '../product/service/product-color.service';
import { ProductSizeService } from '../product/service/product-size.service';
import { ProductColorEntity } from '../product/entities/product-color.entity';
import { ProductSizeEntity } from '../product/entities/product-size.entity';
import { isNan } from '../../common/utils/functions.utils';

@Injectable()
export class BasketService {
  constructor(
    @InjectRepository(BasketEntity)
    private basketRepository: Repository<BasketEntity>,

    private productService: ProductService,
    private productColorService: ProductColorService,
    private productSizeService: ProductSizeService,
  ) {}

  async addToBasket(basketDto: BasketDto) {
    const { productId, colorId, sizeId } = basketDto;

    const product = await this.productService.findOneLean(productId);
    if (product.count === 0)
      throw new BadRequestException('product is out of stock');

    let color: ProductColorEntity | null = null;
    let size: ProductSizeEntity | null = null;
    const where: FindOptionsWhere<BasketEntity> = { productId };

    if (product.type === ProductType.COLORING && !colorId) {
      throw new BadRequestException('color is required');
    } else if (product.type === ProductType.COLORING && colorId) {
      if (isNan(colorId))
        throw new BadRequestException('color must be a number');

      color = await this.productColorService.findOne(colorId);
      where['colorId'] = colorId;
    } else if (product.type === ProductType.SIZING && !sizeId) {
      throw new BadRequestException('size is required');
    } else if (product.type === ProductType.SIZING && sizeId) {
      if (isNan(sizeId)) throw new BadRequestException('size must be a number');

      size = await this.productSizeService.findOne(sizeId);
      where['sizeId'] = sizeId;
    }

    let basketItem = await this.basketRepository.findOneBy(where);

    if (basketItem) {
      if (basketItem.count > product.count)
        throw new BadRequestException(
          'you can not add more than product count',
        );

      basketItem.count += 1;
    } else {
      basketItem = this.basketRepository.create({
        productId,
        colorId: color?.id,
        sizeId: size?.id,
        count: 1,
      });
    }

    await this.basketRepository.save(basketItem);

    return {
      message: 'Product added to basket successfully',
    };
  }

  async removeFromBasket(basketDto: BasketDto) {
    const { productId, colorId, sizeId } = basketDto;

    const product = await this.productService.findOneLean(productId);

    const where: FindOptionsWhere<BasketEntity> = { productId };

    if (product.type === ProductType.COLORING && !colorId) {
      throw new BadRequestException('color is required');
    } else if (product.type === ProductType.COLORING && colorId) {
      if (isNan(colorId))
        throw new BadRequestException('color must be a number');

      where['colorId'] = colorId;
    } else if (product.type === ProductType.SIZING && !sizeId) {
      throw new BadRequestException('size is required');
    } else if (product.type === ProductType.SIZING && sizeId) {
      if (isNan(sizeId)) throw new BadRequestException('size must be a number');

      where['sizeId'] = sizeId;
    }

    const basketItem = await this.basketRepository.findOneBy(where);

    if (basketItem) {
      if (basketItem.count <= 1) {
        await this.basketRepository.delete(basketItem.id);
        return {
          message: 'Product removed from basket successfully',
        };
      } else {
        basketItem.count -= 1;
        await this.basketRepository.save(basketItem);
      }
    } else {
      throw new NotFoundException('product not found in basket');
    }

    return {
      message: 'Product removed from basket successfully',
    };
  }

  async removeFromBasketById(id: number) {
    const basketItem = await this.basketRepository.findOneBy({ id });

    if (basketItem) {
      if (basketItem.count <= 1) {
        await this.basketRepository.delete(basketItem.id);
        return {
          message: 'Product removed from basket successfully',
        };
      } else {
        basketItem.count -= 1;
        await this.basketRepository.save(basketItem);
      }
    } else {
      throw new NotFoundException('product not found in basket');
    }

    return {
      message: 'Product removed from basket successfully',
    };
  }
}
