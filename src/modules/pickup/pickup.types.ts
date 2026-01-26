export interface CreatePickupInput {
  customerId: string;
  addressId: string;
  scheduledPickupAt: Date;
  notes?: string;
  outletId?: string;
}

export interface OutletWithRadius {
  id: string;
  name: string;
  address: string;
  lat: string;
  long: string;
  service_radius: number;
}
