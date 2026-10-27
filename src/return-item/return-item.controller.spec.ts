import { Test, TestingModule } from '@nestjs/testing';
import { ReturnItemController } from './return-item.controller';
import { ReturnItemService } from './return-item.service';

describe('ReturnItemController', () => {
  let controller: ReturnItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReturnItemController],
      providers: [ReturnItemService],
    }).compile();

    controller = module.get<ReturnItemController>(ReturnItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
