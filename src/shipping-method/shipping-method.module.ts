import { Module } from '@nestjs/common';
import { ShippingMethodService } from './shipping-method.service';
import { ShippingMethodController } from './shipping-method.controller';

@Module({
  controllers: [ShippingMethodController],
  providers: [ShippingMethodService],
})
export class ShippingMethodModule {}
