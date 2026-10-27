import { Test, TestingModule } from '@nestjs/testing';
import { WishListItemController } from './wish-list-item.controller';
import { WishListItemService } from './wish-list-item.service';

describe('WishListItemController', () => {
  let controller: WishListItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishListItemController],
      providers: [WishListItemService],
    }).compile();

    controller = module.get<WishListItemController>(WishListItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
