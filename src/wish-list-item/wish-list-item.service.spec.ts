import { Test, TestingModule } from '@nestjs/testing';
import { WishListItemService } from './wish-list-item.service';

describe('WishListItemService', () => {
  let service: WishListItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WishListItemService],
    }).compile();

    service = module.get<WishListItemService>(WishListItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
