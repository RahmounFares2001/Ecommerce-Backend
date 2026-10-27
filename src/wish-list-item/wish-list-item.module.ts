import { Module } from '@nestjs/common';
import { WishListItemService } from './wish-list-item.service';
import { WishListItemController } from './wish-list-item.controller';

@Module({
  controllers: [WishListItemController],
  providers: [WishListItemService],
})
export class WishListItemModule {}
