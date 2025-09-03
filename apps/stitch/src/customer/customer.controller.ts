import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { ApiTokenGuard, JwtAuthGuard } from '@fubs/shared';

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

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
    return await this.customerService.createCustomer(createCustomerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/owner/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get customer by owner ID',
    description: 'Retrieves customer information by owner ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Owner ID',
    example: '04f92bab-cc86-4ede-90d4-cd76dfce3045',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer information retrieved successfully',
    type: CustomerResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid owner ID',
  })
  async getCustomerByOwnerId(
    @Param('id', ParseUUIDPipe) ownerId: string
  ): Promise<CustomerResponseDto | null> {
    const customer = await this.customerService.getCustomerByOwnerId(ownerId);

    return customer;
  }
}
