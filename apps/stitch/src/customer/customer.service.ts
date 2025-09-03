import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { PaymentsService } from '../payment/payments.service';
import type { CreateCustomerDto } from '../payment/payment-provider.interface';
import { CustomerResponseDto } from './dto/customer-response.dto';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentsService
  ) {}

  async getCustomerByEmail(email: string): Promise<CustomerResponseDto | null> {
    const localCustomer = await this.prisma.customer.findUnique({
      where: { email },
    });
    if (!localCustomer) return null;
    return new CustomerResponseDto({
      id: localCustomer.id,
      name: localCustomer.name,
      email: localCustomer.email,
      ownerId: localCustomer.ownerId,
    });
  }

  async createCustomer(
    createCustomerDto: CreateCustomerDto
  ): Promise<CustomerResponseDto> {
    try {
      const existingCustomer = await this.getCustomerByEmail(
        createCustomerDto.email
      );
      if (existingCustomer) {
        this.logger.warn(
          `Customer with email ${createCustomerDto.email} already exists`
        );
        throw new ConflictException(
          `Customer with email ${createCustomerDto.email} already exists`
        );
      }
      const customer = await this.payments.createCustomer(createCustomerDto);

      const localCustomer = await this.prisma.customer.create({
        data: {
          ownerId: createCustomerDto.ownerId,
          name: createCustomerDto.name,
          email: createCustomerDto.email,
          stripeCustomerId: customer.id,
        },
      });
      return new CustomerResponseDto({
        id: localCustomer.id,
        name: localCustomer.name,
        email: localCustomer.email,
        ownerId: localCustomer.ownerId,
      });
    } catch (error) {
      this.logger.error(
        `Failed to create customer: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async getCustomerByOwnerId(
    ownerId: string
  ): Promise<CustomerResponseDto | null> {
    const localCustomer = await this.prisma.customer.findFirst({
      where: { ownerId },
    });
    if (!localCustomer) return null;
    return new CustomerResponseDto({
      id: localCustomer.id,
      name: localCustomer.name,
      email: localCustomer.email,
      ownerId: localCustomer.ownerId,
    });
  }
}
