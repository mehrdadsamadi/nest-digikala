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
import { AddDiscountToBasketDto } from './dto/basket-discount.dto';
import { DiscountService } from '../discount/discount.service';
import { DiscountType } from '../discount/type.enum';

@Injectable()
export class BasketService {
  constructor(
    @InjectRepository(BasketEntity)
    private basketRepository: Repository<BasketEntity>,

    private productService: ProductService,
    private productColorService: ProductColorService,
    private productSizeService: ProductSizeService,
    private discountService: DiscountService,
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

  async addDiscountToBasket(discountDto: AddDiscountToBasketDto) {
    const { code, basketId } = discountDto;

    const basket = await this.basketRepository.findOneBy({ id: basketId });
    if (!basket) throw new NotFoundException('basket not found');

    const discount = await this.discountService.getDiscountByCode(code);
    if (!discount) throw new NotFoundException('discount not found');

    if (discount.type === DiscountType.PRODUCT && discount.productId) {
      const basketItem = await this.basketRepository.findOneBy({
        productId: discount.productId,
      });
      if (!basketItem)
        throw new BadRequestException(
          'not found product in basket for this discount code',
        );
    }

    if (
      discount.limit &&
      (discount.limit <= 0 || discount.usage >= discount.limit)
    )
      throw new BadRequestException('discount limit is 0');

    if (discount.expires_in && discount.expires_in <= new Date())
      throw new BadRequestException('discount expired');

    const existDiscount = await this.basketRepository.findOneBy({
      discountId: discount.id,
    });
    if (existDiscount)
      throw new BadRequestException('discount already exists in basket');

    if (discount.type === DiscountType.BASKET) {
      const item = await this.basketRepository.findOne({
        relations: {
          discount: true,
        },
        where: {
          discount: {
            type: DiscountType.BASKET,
          },
        },
      });
      if (item)
        throw new BadRequestException('you can not add more than one discount');
    }

    await this.basketRepository.update(
      { id: basket.id },
      {
        discountId: discount.id,
      },
    );

    return {
      message: 'discount added to basket successfully',
    };
  }

  async removeDiscountFromBasket(discountDto: AddDiscountToBasketDto) {
    const { code, basketId } = discountDto;

    const discount = await this.discountService.getDiscountByCode(code);
    if (!discount) throw new NotFoundException('discount not found');

    const existDiscount = await this.basketRepository.findOneBy({
      id: basketId,
      discountId: discount.id,
    });

    if (existDiscount) {
      await this.basketRepository.delete({ id: existDiscount.id });
    } else {
      throw new NotFoundException('discount not found in basket');
    }

    return {
      message: 'discount removed from basket successfully',
    };
  }
}
