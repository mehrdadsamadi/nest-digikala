import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '../entities/product.entity';
import { DeepPartial, Repository } from 'typeorm';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import { ProductType } from '../enum/type.enum';
import { toBoolean } from '../../../common/utils/functions.utils';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  async create(productDto: CreateProductDto) {
    const {
      title,
      slug,
      count,
      code,
      content,
      active_discount,
      discount,
      type,
      price,
    } = productDto;

    if (!Object.values(ProductType).includes(type)) {
      throw new BadRequestException(`Invalid product type: ${type}`);
    }

    const productObject: DeepPartial<ProductEntity> = {
      title,
      slug,
      code,
      content,
      discount,
      active_discount: toBoolean(active_discount),
      type,
    };

    if (type === ProductType.SINGLE) {
      Object.assign(productObject, {
        count,
        price,
      });
    }

    await this.productRepository.save(productObject);

    return {
      message: 'Product created successfully',
    };
  }

  async update(id: number, productDto: UpdateProductDto) {
    const {
      title,
      slug,
      count,
      code,
      content,
      active_discount,
      discount,
      type,
      price,
    } = productDto;

    const product = await this.findOneLean(id);

    if (title) product.title = title;
    if (slug) product.slug = slug;
    if (content) product.content = content;
    if (discount) product.discount = discount;
    if (active_discount) product.active_discount = toBoolean(active_discount);
    if (code) product.code = code;
    if (type) product.type = type;

    if (type === ProductType.SINGLE) {
      Object.assign(product, {
        count,
        price,
      });
    }

    await this.productRepository.save(product);

    return {
      message: 'Product updated successfully',
    };
  }

  find() {
    return this.productRepository.find({
      where: {},
      relations: {
        details: true,
        colors: true,
        sizes: true,
      },
      select: {
        details: {
          key: true,
          value: true,
        },
        sizes: {
          size: true,
          count: true,
          price: true,
          discount: true,
          active_discount: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        details: true,
        colors: true,
        sizes: true,
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async findOneLean(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async delete(id: number) {
    await this.findOneLean(id);

    await this.productRepository.delete(id);

    return {
      message: 'Product deleted successfully',
    };
  }
}
