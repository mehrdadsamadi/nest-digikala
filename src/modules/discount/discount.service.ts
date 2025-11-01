import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscountEntity } from './entity/discount.entity';
import { DeepPartial, Repository } from 'typeorm';
import { CreateDiscountDto, UpdateDiscountDto } from './dto/discount.dto';
import { ProductService } from '../product/service/product.service';
import { DiscountType } from './type.enum';
import { isNan, notNan } from '../../common/utils/functions.utils';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(DiscountEntity)
    private discountRepository: Repository<DiscountEntity>,

    private productService: ProductService,
  ) {}

  async create(discountDto: CreateDiscountDto) {
    const { code, limit, percent, expires_in, type, productId, amount } =
      discountDto;

    const discountObject: DeepPartial<DiscountEntity> = { code };

    if (type === DiscountType.PRODUCT && productId) {
      const product = await this.productService.findOneLean(productId);

      discountObject['type'] = DiscountType.PRODUCT;
      discountObject['productId'] = product.id;
    } else {
      discountObject['type'] = DiscountType.BASKET;
    }

    if ((amount && percent) || (!amount && !percent)) {
      throw new BadRequestException(
        'you should choose one of amount or percent',
      );
    }

    if (amount && isNan(amount)) {
      throw new BadRequestException('amount must be a number');
    } else if (amount) {
      discountObject['amount'] = +amount;
    } else if (percent && isNan(percent)) {
      throw new BadRequestException('percent must be a number');
    } else if (percent) {
      discountObject['percent'] = +percent;
    }

    if (expires_in && new Date(expires_in).toString() == 'Invalid Date') {
      throw new BadRequestException('expires in must be a date');
    } else if (expires_in) {
      discountObject['expires_in'] = new Date(expires_in);
    }

    if (limit && notNan(limit)) {
      discountObject['limit'] = +limit;
    }

    const discount = await this.getDiscountByCode(code);
    if (discount) throw new BadRequestException('discount code already exists');

    await this.discountRepository.save(discountObject);

    return {
      message: 'discount created successfully',
    };
  }

  async update(id: number, discountDto: UpdateDiscountDto) {
    const discount = await this.checkExistDiscount(id);

    const { code, limit, percent, expires_in, type, productId, amount } =
      discountDto;

    if (type === DiscountType.PRODUCT && productId) {
      const product = await this.productService.findOneLean(productId);

      discount.type = DiscountType.PRODUCT;
      discount.productId = product.id;
    } else if (type === DiscountType.BASKET) {
      discount.type = DiscountType.BASKET;
    }

    if (amount && percent) {
      throw new BadRequestException(
        'you should choose one of amount or percent',
      );
    }

    if (amount && isNan(amount)) {
      throw new BadRequestException('amount must be a number');
    } else if (amount) {
      discount.amount = +amount;
    } else if (percent && isNan(percent)) {
      throw new BadRequestException('percent must be a number');
    } else if (percent) {
      discount.percent = +percent;
    }

    if (expires_in && new Date(expires_in).toString() == 'Invalid Date') {
      throw new BadRequestException('expires in must be a date');
    } else if (expires_in) {
      discount.expires_in = new Date(expires_in);
    }

    if (limit && notNan(limit)) {
      discount.limit = +limit;
    }

    if (code) {
      const discountRow = await this.getDiscountByCode(code);
      if (discountRow && discountRow.id !== discount.id)
        throw new BadRequestException('discount code already exists');
      discount.code = code;
    }

    await this.discountRepository.save(discount);

    return {
      message: 'discount updated successfully',
    };
  }

  getDiscountByCode(code: string) {
    return this.discountRepository.findOneBy({ code });
  }

  async checkExistDiscount(id: number) {
    const discount = await this.discountRepository.findOneBy({ id });
    if (!discount) throw new NotFoundException('discount not found');

    return discount;
  }

  find() {
    return this.discountRepository.find();
  }
  async delete(id: number) {
    await this.checkExistDiscount(id);

    await this.discountRepository.delete(id);

    return {
      message: 'discount deleted successfully',
    };
  }
}
