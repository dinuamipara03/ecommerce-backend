import { Test, TestingModule } from '@nestjs/testing';
import { ProductFilterService } from './product-filter.service';

describe('ProductFilterService', () => {
  let service: ProductFilterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductFilterService],
    }).compile();

    service = module.get<ProductFilterService>(ProductFilterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
