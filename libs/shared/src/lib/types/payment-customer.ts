export interface CustomerResponseDto {
  id: string;
  email: string;
  name: string;
  ownerId: string;
  paymentProviderCustomerId: string | null;
}
