import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProductEntity } from '../entities/product.entity';
import { ProductSizeEntity } from '../entities/product-size.entity';
import { AddSizeDto, UpdateSizeDto } from '../dto/size.dto';
import { notNan, toBoolean } from '../../../common/utils/functions.utils';
import { ProductType } from '../enum/type.enum';

@Injectable()
export class ProductSizeService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,

    @InjectRepository(ProductSizeEntity)
    private productSizeRepository: Repository<ProductSizeEntity>,

    private dataSource: DataSource,
  ) {}

  async create(sizeDto: AddSizeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const { size, discount, active_discount, price, count, productId } =
        sizeDto;

      const product = await queryRunner.manager.findOneBy(ProductEntity, {
        id: productId,
      });

      if (!product) throw new NotFoundException('Product not found');

      if (product.type !== ProductType.SIZING)
        throw new BadRequestException('Product type is not sizing');

      await queryRunner.manager.insert(ProductSizeEntity, {
        size,
        discount,
        active_discount: toBoolean(active_discount),
        price,
        count,
        productId,
      });

      if (notNan(count) && +count > 0) {
        product.count =
          parseInt(product.count.toString()) + parseInt(count.toString());
        await queryRunner.manager.save(ProductEntity, product);
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Size add to product successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, sizeDto: UpdateSizeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const {
        size: sizeTitle,
        discount,
        active_discount,
        price,
        count,
        productId,
      } = sizeDto;

      const product = await queryRunner.manager.findOneBy(ProductEntity, {
        id: productId,
      });

      if (!product) throw new NotFoundException('Product not found');

      const size = await queryRunner.manager.findOneBy(ProductSizeEntity, {
        id,
      });

      if (!size) throw new NotFoundException('Product size not found');

      if (sizeTitle) size.size = sizeTitle;
      if (discount) size.discount = discount;
      if (active_discount) size.active_discount = toBoolean(active_discount);
      if (price) size.price = price;
      if (discount) size.discount = discount;

      if (count && notNan(count) && +count > 0) {
        product.count =
          parseInt(product.count.toString()) - parseInt(size.count.toString());
        product.count =
          parseInt(product.count.toString()) + parseInt(count.toString());

        size.count = count;
        await queryRunner.manager.save(ProductEntity, product);
      }

      await queryRunner.manager.save(ProductSizeEntity, size);

      await queryRunner.commitTransaction();

      return {
        message: 'Size add to product successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  find(productId: number) {
    return this.productSizeRepository.find({
      where: { productId },
    });
  }

  async findOne(id: number) {
    const size = await this.productSizeRepository.findOneBy({ id });

    if (!size) throw new NotFoundException('Product size not found');

    return size;
  }

  async delete(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const size = await this.findOne(id);

      if (size.count && +size.count > 0) {
        const product = await this.productRepository.findOneBy({
          id: size.productId,
        });
        if (!product) throw new NotFoundException('Product not found');

        product.count =
          parseInt(product.count.toString()) - parseInt(size.count.toString());

        await queryRunner.manager.save(ProductEntity, product);
      }

      await queryRunner.manager.delete(ProductSizeEntity, id);

      await queryRunner.commitTransaction();

      return {
        message: 'Product size deleted successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
