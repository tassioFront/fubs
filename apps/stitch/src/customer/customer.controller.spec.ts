import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { PaymentsService } from '../payment/payments.service';

describe('CustomerController', () => {
  let controller: CustomerController;
  let mockPaymentsService: {
    createCustomer: jest.Mock;
    getCustomer: jest.Mock;
  };

  beforeEach(async () => {
    mockPaymentsService = {
      createCustomer: jest.fn(),
      getCustomer: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCustomer', () => {
    it('should create a customer successfully', async () => {
      const createCustomerDto = {
        email: 'test@example.com',
        name: 'Test User',
        metadata: { ownerId: 'owner_123' },
      };

      const expectedCustomer = {
        id: 'cus_123',
        email: 'test@example.com',
        name: 'Test User',
        metadata: { ownerId: 'owner_123' },
      };

      mockPaymentsService.createCustomer.mockResolvedValue(expectedCustomer);

      const result = await controller.createCustomer(createCustomerDto);

      expect(mockPaymentsService.createCustomer).toHaveBeenCalledWith(
        createCustomerDto
      );
      expect(result).toEqual(expectedCustomer);
    });
  });

  describe('getCustomer', () => {
    it('should get a customer successfully', async () => {
      const customerId = 'cus_123';
      const expectedCustomer = {
        id: customerId,
        email: 'test@example.com',
        name: 'Test User',
        metadata: { ownerId: 'owner_123' },
      };

      mockPaymentsService.getCustomer.mockResolvedValue(expectedCustomer);

      const result = await controller.getCustomer(customerId);

      expect(mockPaymentsService.getCustomer).toHaveBeenCalledWith(customerId);
      expect(result).toEqual(expectedCustomer);
    });
  });
});
