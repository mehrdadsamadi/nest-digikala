import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';

@Controller('payment')
@ApiTags('Payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  create() {
    return this.paymentService.create();
  }
}
