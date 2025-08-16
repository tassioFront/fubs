import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsEnum(['FREE', 'SOLO', 'ENTERPRISE'])
  planType: 'FREE' | 'SOLO' | 'ENTERPRISE';

  @IsString()
  @IsNotEmpty()
  successUrl: string;

  @IsString()
  @IsNotEmpty()
  cancelUrl: string;
}
