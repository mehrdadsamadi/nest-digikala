import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentEntity } from './entity/payment.entity';
import { Repository } from 'typeorm';
import { BasketService } from '../basket/basket.service';
import { ZarinpalService } from '../http/zarinpal.service';
import { OrderEntity } from '../order/entity/order.entity';
import { OrderItemsEntity } from '../order/entity/order-items.entity';
import { OrderStatus } from '../order/enum/order-status.enum';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,

    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,

    @InjectRepository(OrderItemsEntity)
    private orderItemsRepository: Repository<OrderItemsEntity>,

    private basketService: BasketService,
    private zarinpalService: ZarinpalService,
  ) {}

  async create(address: string) {
    const user = { email: 'samadimehrdad49@gmail.com', mobile: '09371567428' };

    const basket = await this.basketService.getBasket();

    let order = this.orderRepository.create({
      final_amount: basket.finalAmount,
      total_amount: basket.totalPrice,
      discount_amount: basket.totalDiscountAmount,
      address,
      status: OrderStatus.PENDING,
    });

    order = await this.orderRepository.save(order);

    const orderItems = basket.products.map((product) => ({
      orderId: order.id,
      productId: product.id,
      colorId: product?.colorId,
      sizeId: product?.sizeId,
      count: product?.count,
    }));

    await this.orderItemsRepository.insert(orderItems);

    const { authority, gatewayUrl } = this.zarinpalService.sendRequest({
      amount: basket.finalAmount,
      description: 'خرید محصول',
      user,
    }) as any;

    let payment = this.paymentRepository.create({
      amount: basket.finalAmount,
      authority,
      orderId: order.id,
      invoice_number: `INV-${order.id}-${new Date().getTime()}`,
    });

    payment = await this.paymentRepository.save(payment);

    order.paymentId = payment.id;

    await this.orderRepository.save(order);

    return { gatewayUrl };
  }

  async verify(authority: string, status: string) {
    const payment = await this.paymentRepository.findOneBy({ authority });
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status)
      throw new BadRequestException('Payment already verified');

    if (status === 'OK') {
      const order = await this.orderRepository.findOneBy({
        id: payment.orderId,
      });
      if (!order) throw new NotFoundException('Order not found');

      order.status = OrderStatus.ORDERED;
      payment.status = true;

      await Promise.all([
        this.orderRepository.save(order),
        this.paymentRepository.save(payment),
      ]);

      return 'https://url.ir/payment/success?OrderId=' + order.id;
    } else {
      return 'https://url.ir/payment/fail';
    }
  }

  find() {
    return this.paymentRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
