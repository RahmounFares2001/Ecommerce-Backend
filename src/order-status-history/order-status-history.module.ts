import { Module } from '@nestjs/common';
import { OrderStatusHistoryService } from './order-status-history.service';
import { OrderStatusHistoryController } from './order-status-history.controller';

@Module({
  controllers: [OrderStatusHistoryController],
  providers: [OrderStatusHistoryService],
})
export class OrderStatusHistoryModule {}
