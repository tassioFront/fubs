import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { PaymentsService } from '../payment/payments.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { ApiTokenGuard, JwtAuthGuard } from '@fubs/shared';

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(ApiTokenGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new customer',
    description: 'Creates a new customer in the payment provider system',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Customer successfully created',
    type: CustomerResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Customer already exists',
  })
  async createCustomer(
    @Body() createCustomerDto: CreateCustomerDto
  ): Promise<CustomerResponseDto> {
    const customer = {
      email: createCustomerDto.email,
      name: createCustomerDto.name,
      metadata: {
        ownerId: createCustomerDto.ownerId,
      },
    };
    return await this.paymentsService.createCustomer(customer);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get customer by ID',
    description: 'Retrieves customer information by customer ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
    example: 'cus_abc123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer information retrieved successfully',
    type: CustomerResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid customer ID',
  })
  async getCustomer(
    @Param('id') customerId: string
  ): Promise<CustomerResponseDto> {
    return await this.paymentsService.getCustomer(customerId);
  }
}
