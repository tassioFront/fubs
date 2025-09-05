import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({
    description: 'Unique customer identifier',
    example: 'cus_abc123',
  })
  id: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Customer full name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Customer ownerId',
    example: 'owner_123',
  })
  ownerId: string;

  @ApiProperty({
    description: 'Customer Stripe Id',
    example: 'cus_123',
  })
  paymentProviderCustomerId: string | null;

  constructor(partial: Partial<CustomerResponseDto>) {
    Object.assign(this, partial);
  }
}
