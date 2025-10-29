import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductDetailEntity } from '../entities/product-detail.entity';
import { AddDetailDto, UpdateDetailDto } from '../dto/detail.dto';
import { ProductService } from './product.service';

@Injectable()
export class ProductDetailService {
  constructor(
    @InjectRepository(ProductDetailEntity)
    private productDetailRepository: Repository<ProductDetailEntity>,

    private productService: ProductService,
  ) {}

  async create(detailDto: AddDetailDto) {
    const { key, value, productId } = detailDto;

    await this.productService.findOneLean(productId);

    await this.productDetailRepository.insert({
      key,
      value,
      productId,
    });

    return {
      message: 'Detail add to product successfully',
    };
  }

  async update(id: number, detailDto: UpdateDetailDto) {
    const { key, value, productId } = detailDto;

    const detail = await this.findOne(id);

    if (productId) {
      await this.productService.findOneLean(productId);
      detail.productId = productId;
    }

    if (key) detail.key = key;
    if (value) detail.value = value;

    await this.productDetailRepository.save(detail);

    return {
      message: 'Product detail updated successfully',
    };
  }

  find(productId: number) {
    return this.productDetailRepository.find({
      where: { productId },
    });
  }

  async findOne(id: number) {
    const detail = await this.productDetailRepository.findOneBy({ id });

    if (!detail) throw new NotFoundException('Product detail not found');

    return detail;
  }

  async delete(id: number) {
    await this.findOne(id);

    await this.productDetailRepository.delete(id);

    return {
      message: 'Product detail deleted successfully',
    };
  }
}
