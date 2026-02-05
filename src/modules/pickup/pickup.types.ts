export interface CreatePickupInput {
  customerId: string;
  addressId: string;
  scheduledPickupAt: Date;
  notes?: string;
  outletId?: string;
  items?: { laundryItemId: string; qty: number }[];
  manualItems?: { name: string; quantity: number }[];
}

export interface OutletWithRadius {
  id: string;
  name: string;
  address: string;
  lat: string;
  long: string;
  service_radius: number;
}
