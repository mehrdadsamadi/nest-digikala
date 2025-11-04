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

    // آیتم‌هایی که تخفیف محصولی دارند (برای دسترسی سریع)
    const productDiscountItems = basketItems.filter(
      (it) => it?.discountId && it?.discount?.type === DiscountType.PRODUCT,
    );

    // آیتم‌هایی که تخفیف سبد دارند (برای اعمال بعد از محاسبهٔ محصولات)
    const basketDiscountItems = basketItems.filter(
      (it) => it?.discountId && it?.discount?.type === DiscountType.BASKET,
    );

    // Helper: اعمال تخفیف فعال روی یک واحد و برگرداندن { unitPriceAfter, unitDiscountAmount }
    const applyActiveDiscount = (
      unitPrice: number,
      active: boolean,
      discountValue: number,
    ) => {
      if (!active || !discountValue)
        return { unitPriceAfter: unitPrice, unitDiscountAmount: 0 };
      const { newPrice, newDiscountAmount } = this.checkDiscountPercent(
        unitPrice,
        discountValue,
      );
      return {
        unitPriceAfter: newPrice,
        unitDiscountAmount: newDiscountAmount,
      };
    };

    // Helper: اعمال یک تخفیف (percent یا amount) روی unitPrice
    const applyDiscountObject = (
      unitPrice: number,
      discountObj: DiscountEntity,
    ) => {
      if (!discountObj)
        return { unitPriceAfter: unitPrice, unitDiscountAmount: 0 };
      if (discountObj.percent) {
        const { newPrice, newDiscountAmount } = this.checkDiscountPercent(
          unitPrice,
          +discountObj.percent,
        );
        return {
          unitPriceAfter: newPrice,
          unitDiscountAmount: newDiscountAmount,
        };
      } else if (discountObj.amount) {
        const { newPrice, newDiscountAmount } = this.checkDiscountAmount(
          unitPrice,
          +discountObj.amount,
        );
        return {
          unitPriceAfter: newPrice,
          unitDiscountAmount: newDiscountAmount,
        };
      }
      return { unitPriceAfter: unitPrice, unitDiscountAmount: 0 };
    };

    for (const item of basketItems) {
      const { product, color, size, discount: itemDiscount, count = 1 } = item;
      const qty = +count;

      if (!product) continue; // محافظت در برابر دادهٔ خراب

      // تعیین قیمت یک واحد بر اساس type (بدون تغییر انتیتی)
      let originalUnitPrice = 0;
      let unitActive = false;
      let unitActiveDiscountValue = 0;
      let productMeta: Partial<ReturnProduct> = {};

      if (product.type === ProductType.SINGLE) {
        originalUnitPrice = +product.price;
        unitActive = !!product.active_discount;
        unitActiveDiscountValue = +product.discount;
        productMeta = {
          id: product.id,
          slug: product.slug,
          title: product.title,
          active_discount: product.active_discount,
          discount: +product.discount,
        };
      } else if (product.type === ProductType.SIZING) {
        if (!size) continue;
        originalUnitPrice = +size.price;
        unitActive = !!size.active_discount;
        unitActiveDiscountValue = +size.discount;
        productMeta = {
          id: product.id,
          slug: product.slug,
          title: product.title,
          active_discount: size.active_discount,
          discount: +size.discount,
          size: size.size,
        };
      } else if (product.type === ProductType.COLORING) {
        if (!color) continue;
        originalUnitPrice = +color.price;
        unitActive = !!color.active_discount;
        unitActiveDiscountValue = +color.discount;
        productMeta = {
          id: product.id,
          slug: product.slug,
          title: product.title,
          active_discount: color.active_discount,
          discount: +color.discount,
          color_name: color.color_name,
          color_code: color.color_code,
        };
      } else {
        // اگر نوع محصول ناشناخته بود می‌تونیم skip کنیم
        continue;
      }

      // جمع مبلغ بدون تخفیف (برای گزارش)
      totalPrice += originalUnitPrice * qty;

      // 1) اعمال تخفیف فعال محصول (در صورتی که وجود داشته باشد)
      let { unitPriceAfter, unitDiscountAmount } = applyActiveDiscount(
        originalUnitPrice,
        unitActive,
        unitActiveDiscountValue,
      );

      // 2) اگر برای این محصول کوپن/تخفیف خاصی در basket وجود دارد (productDiscountItems)
      const productDiscountItem = productDiscountItems.find(
        (it) => it.productId === product.id,
      );
      if (productDiscountItem) {
        const discountObj = productDiscountItem.discount;
        if (this.validateDiscount(discountObj)) {
          // اضافه کردن جزئیات تخفیف (ممکن است بعداً یکتا شود)
          discounts.push({
            percent: +discountObj.percent,
            amount: +discountObj.amount,
            code: discountObj.code,
            type: discountObj.type,
            productId: discountObj.productId,
          });

          const applied = applyDiscountObject(unitPriceAfter, discountObj);
          unitPriceAfter = applied.unitPriceAfter;
          unitDiscountAmount += applied.unitDiscountAmount;
        }
      }

      // مقدار کل تخفیف برای این آیتم = unitDiscountAmount * qty
      const itemTotalDiscount = unitDiscountAmount * qty;
      totalDiscountAmount += itemTotalDiscount;

      // مقدار نهایی اضافه شده به finalAmount
      finalAmount += unitPriceAfter * qty;

      // اضافه کردن محصول به آرایهٔ خروجی (قیمت نمایش‌دهی = قیمت بعد از تخفیف به ازای هر واحد)
      products.push({
        ...productMeta,
        price: +unitPriceAfter,
        count: qty,
      } as ReturnProduct);
    }

    // --- حالا تخفیف‌های BASKET را یکجا اعمال می‌کنیم (هر کوپن معتبر یکبار)
    for (const bItem of basketDiscountItems) {
      const discountObj = bItem.discount;
      if (!discountObj) continue;
      if (!this.validateDiscount(discountObj)) continue;

      // افزودن به لیست تخفیف‌ها (نمایش)
      discounts.push({
        percent: +discountObj.percent,
        amount: +discountObj.amount,
        code: discountObj.code,
        type: discountObj.type,
        productId: discountObj.productId,
      });

      if (discountObj.percent) {
        const { newPrice, newDiscountAmount } = this.checkDiscountPercent(
          +finalAmount,
          +discountObj.percent,
        );
        totalDiscountAmount += newDiscountAmount;
        finalAmount = newPrice;
      } else if (discountObj.amount) {
        const { newPrice, newDiscountAmount } = this.checkDiscountAmount(
          +finalAmount,
          +discountObj.amount,
        );
        totalDiscountAmount += newDiscountAmount;
        finalAmount = newPrice;
      }
    }

    return {
      totalPrice,
      finalAmount,
      totalDiscountAmount,
      products,
      discounts,
      productDiscounts: productDiscountItems,
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
