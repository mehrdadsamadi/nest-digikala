import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProductEntity } from '../entities/product.entity';
import { toBoolean } from '../../../common/utils/functions.utils';
import { ProductType } from '../enum/type.enum';
import { ProductColorEntity } from '../entities/product-color.entity';
import { AddColorDto, UpdateColorDto } from '../dto/color.dto';

@Injectable()
export class ProductColorService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,

    @InjectRepository(ProductColorEntity)
    private productColorRepository: Repository<ProductColorEntity>,

    private dataSource: DataSource,
  ) {}

  async create(colorDto: AddColorDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const {
        color_code,
        color_name,
        discount,
        active_discount,
        price,
        count,
        productId,
      } = colorDto;

      const product = await queryRunner.manager.findOneBy(ProductEntity, {
        id: productId,
      });

      if (!product) throw new NotFoundException('Product not found');

      if (product.type !== ProductType.COLORING)
        throw new BadRequestException('Product type is not coloring');

      await queryRunner.manager.insert(ProductColorEntity, {
        color_code,
        color_name,
        discount,
        active_discount: toBoolean(active_discount),
        price,
        count,
        productId,
      });

      if (!isNaN(parseInt(count.toString())) && +count > 0) {
        product.count =
          parseInt(product.count.toString()) + parseInt(count.toString());
        await queryRunner.manager.save(ProductEntity, product);
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Color add to product successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, colorDto: UpdateColorDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const {
        color_code,
        color_name,
        discount,
        active_discount,
        price,
        count,
        productId,
      } = colorDto;

      const product = await queryRunner.manager.findOneBy(ProductEntity, {
        id: productId,
      });

      if (!product) throw new NotFoundException('Product not found');

      const color = await queryRunner.manager.findOneBy(ProductColorEntity, {
        id,
      });

      if (!color) throw new NotFoundException('Product color not found');

      if (color_code) color.color_code = color_code;
      if (color_name) color.color_name = color_name;
      if (discount) color.discount = discount;
      if (active_discount) color.active_discount = toBoolean(active_discount);
      if (price) color.price = price;
      if (discount) color.discount = discount;

      if (count && !isNaN(parseInt(count.toString())) && +count > 0) {
        product.count =
          parseInt(product.count.toString()) - parseInt(color.count.toString());
        product.count =
          parseInt(product.count.toString()) + parseInt(count.toString());

        color.count = count;
        await queryRunner.manager.save(ProductEntity, product);
      }

      await queryRunner.manager.save(ProductColorEntity, color);

      await queryRunner.commitTransaction();

      return {
        message: 'Color add to product successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  find(productId: number) {
    return this.productColorRepository.find({
      where: { productId },
    });
  }

  async findOne(id: number) {
    const color = await this.productColorRepository.findOneBy({ id });

    if (!color) throw new NotFoundException('Product color not found');

    return color;
  }

  async delete(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const color = await this.findOne(id);

      if (color.count && +color.count > 0) {
        const product = await this.productRepository.findOneBy({
          id: color.productId,
        });
        if (!product) throw new NotFoundException('Product not found');

        product.count =
          parseInt(product.count.toString()) - parseInt(color.count.toString());

        await queryRunner.manager.save(ProductEntity, product);
      }

      await queryRunner.manager.delete(ProductColorEntity, id);

      await queryRunner.commitTransaction();

      return {
        message: 'Product color deleted successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
