export interface SaveCustomerParams {
  email: string;
  name: string;
  ownerId: string;
}

export interface SaveCustomerResponse {
  email: string;
  name: string;
  ownerId: string;
  id: string;
}
