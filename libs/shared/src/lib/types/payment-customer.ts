export interface CustomerResponseDto {
  id: string;
  email: string;
  name: string;
  ownerId: string;
  stripeCustomerId: string | null;
}
