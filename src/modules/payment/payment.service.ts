import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentEntity } from './entity/payment.entity';
import { Repository } from 'typeorm';
import { BasketService } from '../basket/basket.service';
import { ZarinpalService } from '../http/zarinpal.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,

    private basketService: BasketService,
    private zarinpalService: ZarinpalService,
  ) {}

  async create() {
    const user = { email: 'samadimehrdad49@gmail.com', mobile: '09371567428' };

    const basket = await this.basketService.getBasket();

    return this.zarinpalService.sendRequest({
      amount: basket.finalAmount,
      description: 'خرید محصول',
      user,
    });
  }

  async find() {}
}
