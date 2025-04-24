import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartItem } from './entities/cart.entity';
import { ProductService } from '../products/products.service';
import { Repository } from 'typeorm';

// Create mock repository
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

// Create mock product service
const mockProductService = {
  findById: jest.fn(),
};

describe('CartService', () => {
  let service: CartService;
  let repository: Repository<CartItem>;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(CartItem),
          useValue: mockRepository,
        },
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    repository = module.get<Repository<CartItem>>(getRepositoryToken(CartItem));
    productService = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToCart', () => {
    it('should add new item to cart', async () => {
      const userId = 1;
      const addToCartDto = { productId: 1, quantity: 2 };
      const product = { id: 1, name: 'Test Product', price: 100 };
      
      mockProductService.findById.mockResolvedValue(product);
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ userId, ...addToCartDto });
      mockRepository.save.mockResolvedValue({ id: 1, userId, ...addToCartDto });

      const result = await service.addToCart(userId, addToCartDto);
      
      expect(result).toEqual(expect.objectContaining({
        id: expect.any(Number),
        userId,
        productId: addToCartDto.productId,
        quantity: addToCartDto.quantity,
      }));
    });

    it('should update quantity if item exists', async () => {
      const userId = 1;
      const addToCartDto = { productId: 1, quantity: 2 };
      const existingItem = {
        id: 1,
        userId,
        productId: addToCartDto.productId,
        quantity: 1,
      };
      
      mockProductService.findById.mockResolvedValue({ id: 1, name: 'Test Product' });
      mockRepository.findOne.mockResolvedValue(existingItem);
      mockRepository.save.mockResolvedValue({
        ...existingItem,
        quantity: existingItem.quantity + addToCartDto.quantity,
      });

      const result = await service.addToCart(userId, addToCartDto);
      
      expect(result.quantity).toBe(existingItem.quantity + addToCartDto.quantity);
    });
  });

  describe('getCart', () => {
    it('should return cart with items and total', async () => {
      const userId = 1;
      const cartItems = [
        {
          id: 1,
          userId,
          productId: 1,
          quantity: 2,
          product: { id: 1, name: 'Product 1', price: 100, images: ['image1.jpg'] },
        },
      ];

      mockRepository.find.mockResolvedValue(cartItems);

      const result = await service.getCart(userId);

      expect(result).toEqual({
        items: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            productId: expect.any(Number),
            name: expect.any(String),
            price: expect.any(Number),
            quantity: expect.any(Number),
            subtotal: expect.any(Number),
          }),
        ]),
        total: expect.any(Number),
      });
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const userId = 1;
      const cartItemId = 1;
      const cartItem = { id: cartItemId, userId };

      mockRepository.findOne.mockResolvedValue(cartItem);
      mockRepository.remove.mockResolvedValue(cartItem);

      const result = await service.removeFromCart(userId, cartItemId);

      expect(result).toEqual({ message: 'Item removed from cart' });
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', async () => {
      const userId = 1;
      const cartItemId = 1;
      const quantity = 3;
      const cartItem = { id: cartItemId, userId, quantity: 1 };

      mockRepository.findOne.mockResolvedValue(cartItem);
      mockRepository.save.mockResolvedValue({ ...cartItem, quantity });

      const result = await service.updateQuantity(userId, cartItemId, quantity);

      expect(result.quantity).toBe(quantity);
    });
  });
});
