import { Test, TestingModule } from '@nestjs/testing';
import { ReturnItemService } from './return-item.service';

describe('ReturnItemService', () => {
  let service: ReturnItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReturnItemService],
    }).compile();

    service = module.get<ReturnItemService>(ReturnItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
