import { Test, TestingModule } from '@nestjs/testing';
import { ProductFilterController } from './product-filter.controller';
import { ProductFilterService } from './product-filter.service';

describe('ProductFilterController', () => {
  let controller: ProductFilterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductFilterController],
      providers: [ProductFilterService],
    }).compile();

    controller = module.get<ProductFilterController>(ProductFilterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
