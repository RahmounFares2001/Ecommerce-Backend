import { Module } from '@nestjs/common';
import { ReturnItemService } from './return-item.service';
import { ReturnItemController } from './return-item.controller';

@Module({
  controllers: [ReturnItemController],
  providers: [ReturnItemService],
})
export class ReturnItemModule {}
