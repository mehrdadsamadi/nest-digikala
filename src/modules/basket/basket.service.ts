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
import {
  ReturnDiscount,
  ReturnProduct,
} from './interface/get-basket.interface';
import { DiscountEntity } from '../discount/entity/discount.entity';

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

  async getBasket() {
    const products: ReturnProduct[] = [];
    const discounts: ReturnDiscount[] = [];
    let finalAmount = 0;
    let totalDiscountAmount = 0;
    let totalPrice = 0;

    const basketItems = await this.basketRepository.find({
      where: {},
      relations: {
        product: true,
        color: true,
        size: true,
        discount: true,
      },
    });

    const productDiscounts = basketItems.filter(
      (item) =>
        item?.discountId && item?.discount?.type === DiscountType.PRODUCT,
    );

    for (const item of basketItems) {
      const { product, color, size, discount, count } = item;

      let discountAmount = 0;

      if (product.type === ProductType.SINGLE) {
        totalPrice += +product.price * +count;

        if (product.active_discount) {
          const { newPrice, newDiscountAmount } = this.checkDiscountPercent(
            +product.price,
            +product.discount,
          );
          discountAmount = newDiscountAmount;
          product.price = newPrice;
          totalDiscountAmount += discountAmount;
        }

        const existDiscount = productDiscounts.find(
          (dis) => dis.productId === product.id,
        );

        if (existDiscount) {
          const { discount } = existDiscount;

          if (this.validateDiscount(discount)) {
            discounts.push({
              percent: +discount.percent,
              amount: +discount.amount,
              code: discount.code,
              type: discount.type,
              productId: discount.productId,
            });

            if (discount.percent) {
              const { newPrice, newDiscountAmount } = this.checkDiscountPercent(
                +product.price,
                +discount.percent,
              );
              discountAmount += newDiscountAmount;
              product.price = newPrice;
            } else if (discount.amount) {
              const { newPrice, newDiscountAmount } = this.checkDiscountAmount(
                +product.price,
                +discount.amount,
              );
              discountAmount += newDiscountAmount;
              product.price = newPrice;
            }
          }

          totalDiscountAmount += discountAmount;
        }

        finalAmount += +product.price * +count;

        products.push({
          id: product.id,
          slug: product.slug,
          title: product.title,
          active_discount: product.active_discount,
          discount: +product.discount,
          price: +product.price,
          count: +count,
        });
      } else if (product.type === ProductType.SIZING) {
        totalPrice += +size.price * +count;

        if (size.active_discount) {
          const { newPrice, newDiscountAmount } = this.checkDiscountPercent(
            +size.price,
            +size.discount,
          );
          discountAmount = newDiscountAmount;
          size.price = newPrice;
        }

        const existDiscount = productDiscounts.find(
          (dis) => dis.productId === product.id,
        );

        if (existDiscount) {
          const { discount } = existDiscount;

          if (this.validateDiscount(discount)) {
            discounts.push({
              percent: +discount.percent,
              amount: +discount.amount,
              code: discount.code,
              type: discount.type,
              productId: discount.productId,
            });

            if (discount.percent) {
              const { newPrice, newDiscountAmount } = this.checkDiscountPercent(
                +size.price,
                +discount.percent,
              );
              discountAmount += newDiscountAmount;
              size.price = newPrice;
            } else if (discount.amount) {
              const { newPrice, newDiscountAmount } = this.checkDiscountAmount(
                +size.price,
                +discount.amount,
              );
              discountAmount += newDiscountAmount;
              size.price = newPrice;
            }
          }

          totalDiscountAmount += discountAmount;
        }

        finalAmount += +size.price * +count;

        products.push({
          id: product.id,
          slug: product.slug,
          title: product.title,
          active_discount: size.active_discount,
          discount: +size.discount,
          price: +size.price,
          count: +count,
          size: size.size,
        });
      } else if (product.type === ProductType.COLORING) {
        totalPrice += +color.price * +count;

        if (color.active_discount) {
          const { newPrice, newDiscountAmount } = this.checkDiscountPercent(
            +color.price,
            +color.discount,
          );
          discountAmount = newDiscountAmount;
          color.price = newPrice;
        }

        const existDiscount = productDiscounts.find(
          (dis) => dis.productId === product.id,
        );

        if (existDiscount) {
          const { discount } = existDiscount;

          if (this.validateDiscount(discount)) {
            discounts.push({
              percent: +discount.percent,
              amount: +discount.amount,
              code: discount.code,
              type: discount.type,
              productId: discount.productId,
            });

            if (discount.percent) {
              const { newPrice, newDiscountAmount } = this.checkDiscountPercent(
                +color.price,
                +discount.percent,
              );
              discountAmount += newDiscountAmount;
              color.price = newPrice;
            } else if (discount.amount) {
              const { newPrice, newDiscountAmount } = this.checkDiscountAmount(
                +color.price,
                +discount.amount,
              );
              discountAmount += newDiscountAmount;
              color.price = newPrice;
            }
          }

          totalDiscountAmount += discountAmount;
        }

        finalAmount += +color.price * +count;

        products.push({
          id: product.id,
          slug: product.slug,
          title: product.title,
          active_discount: color.active_discount,
          discount: +color.discount,
          price: +color.price,
          count: +count,
          color_name: color.color_name,
          color_code: color.color_code,
        });
      } else if (
        discount &&
        this.validateDiscount(discount) &&
        discount.type === DiscountType.BASKET
      ) {
        discounts.push({
          percent: +discount.percent,
          amount: +discount.amount,
          code: discount.code,
          type: discount.type,
          productId: discount.productId,
        });

        if (discount.percent) {
          const { newPrice, newDiscountAmount } = this.checkDiscountPercent(
            +finalAmount,
            +discount.percent,
          );

          discountAmount = newDiscountAmount;
          finalAmount = newPrice;
        } else if (discount.amount) {
          const { newPrice, newDiscountAmount } = this.checkDiscountAmount(
            +finalAmount,
            +discount.amount,
          );

          discountAmount = newDiscountAmount;
          finalAmount = newPrice;
        }

        totalDiscountAmount += discountAmount;
      }
    }

    return {
      totalPrice,
      finalAmount,
      totalDiscountAmount,
      products,
      discounts,
      productDiscounts,
    };
  }

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

  validateDiscount(discount: DiscountEntity) {
    const limitCondition = discount.limit && discount.limit > discount.usage;
    const expireCondition =
      discount.expires_in && discount.expires_in > new Date();

    return limitCondition || expireCondition;
  }

  checkDiscountPercent(price: number, percent: number) {
    const newDiscountAmount = +price * (+percent / 100);
    const newPrice =
      +newDiscountAmount > +price ? 0 : +price - +newDiscountAmount;

    return {
      newPrice,
      newDiscountAmount,
    };
  }

  checkDiscountAmount(price: number, amount: number) {
    const newPrice = +amount > +price ? 0 : +price - +amount;

    return {
      newPrice,
      newDiscountAmount: +amount,
    };
  }
}
