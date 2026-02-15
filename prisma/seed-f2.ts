/// <reference types="node" />
import {
  PrismaClient,
  Role,
  Staff_Type,
  Pickup_Request_Status,
  Order_Status,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 [seed-f2] Adding pickup orders for outlet admin testing...");

  // ================================
  // 1. FETCH EXISTING DATA (from seed-f3)
  // ================================
  console.log("📦 Fetching existing outlets, staff, customers, and items...");

  const outlets = await prisma.outlet.findMany();
  if (outlets.length < 2) {
    throw new Error("Expected at least 2 outlets from seed-f3. Run seed-f3 first.");
  }

  const jakbar = outlets.find((o) => o.name.includes("Barat"));
  const jaktim = outlets.find((o) => o.name.includes("Timur"));
  if (!jakbar || !jaktim) {
    throw new Error("Could not find Jakbar/Jaktim outlets. Run seed-f3 first.");
  }

  // Fetch outlet admins (via staff table)
  const jakbarAdminStaff = await prisma.staff.findMany({
    where: { outlet_id: jakbar.id, staff_type: Staff_Type.OUTLET_ADMIN },
    include: { staff: true },
  });
  const jaktimAdminStaff = await prisma.staff.findMany({
    where: { outlet_id: jaktim.id, staff_type: Staff_Type.OUTLET_ADMIN },
    include: { staff: true },
  });

  if (jakbarAdminStaff.length === 0 || jaktimAdminStaff.length === 0) {
    throw new Error("No outlet admins found. Run seed-f3 first.");
  }

  // Fetch customers with addresses
  const customers = await prisma.user.findMany({
    where: { role: Role.CUSTOMER },
    include: {
      customer_address: { where: { is_primary: true }, take: 1 },
    },
  });
  if (customers.length === 0) {
    throw new Error("No customers found. Run seed-f3 first.");
  }

  // Fetch laundry items
  const laundryItems = await prisma.laundry_Item.findMany();
  if (laundryItems.length === 0) {
    throw new Error("No laundry items found. Run seed-f3 first.");
  }

  // Build item lookup by name
  const itemByName = (name: string) => {
    const item = laundryItems.find((li) => li.name === name);
    if (!item) throw new Error(`Laundry item "${name}" not found`);
    return item;
  };

  // ================================
  // 2. DEFINE ORDER DATA
  // ================================
  interface SeedOrderItem {
    itemName: string;
    qty: number;
  }

  interface SeedOrder {
    outletId: string;
    adminId: string;
    items: SeedOrderItem[];
  }

  const jakbarAdminId = jakbarAdminStaff[0].staff_id;
  const jaktimAdminId = jaktimAdminStaff[0].staff_id;

  const seedOrders: SeedOrder[] = [
    // === Jakbar (5 orders) ===
    {
      outletId: jakbar.id,
      adminId: jakbarAdminId,
      items: [
        { itemName: "Kemeja", qty: 3 },
        { itemName: "Celana Panjang", qty: 2 },
      ],
    },
    {
      outletId: jakbar.id,
      adminId: jakbarAdminId,
      items: [
        { itemName: "Kaos", qty: 5 },
        { itemName: "Jaket", qty: 1 },
        { itemName: "Rok", qty: 2 },
      ],
    },
    {
      outletId: jakbar.id,
      adminId: jakbarAdminId,
      items: [
        { itemName: "Jas", qty: 1 },
        { itemName: "Dress", qty: 2 },
      ],
    },
    {
      outletId: jakbar.id,
      adminId: jakbarAdminId,
      items: [
        { itemName: "Selimut", qty: 3 },
        { itemName: "Sprei", qty: 2 },
        { itemName: "Handuk", qty: 4 },
      ],
    },
    {
      outletId: jakbar.id,
      adminId: jakbarAdminId,
      items: [
        { itemName: "Kemeja", qty: 2 },
        { itemName: "Kaos", qty: 3 },
        { itemName: "Jaket", qty: 1 },
        { itemName: "Celana Panjang", qty: 1 },
      ],
    },

    // === Jaktim (5 orders) ===
    {
      outletId: jaktim.id,
      adminId: jaktimAdminId,
      items: [
        { itemName: "Rok", qty: 4 },
        { itemName: "Dress", qty: 1 },
      ],
    },
    {
      outletId: jaktim.id,
      adminId: jaktimAdminId,
      items: [
        { itemName: "Handuk", qty: 6 },
        { itemName: "Selimut", qty: 2 },
      ],
    },
    {
      outletId: jaktim.id,
      adminId: jaktimAdminId,
      items: [
        { itemName: "Kaos", qty: 3 },
        { itemName: "Kemeja", qty: 2 },
        { itemName: "Jas", qty: 1 },
      ],
    },
    {
      outletId: jaktim.id,
      adminId: jaktimAdminId,
      items: [
        { itemName: "Celana Panjang", qty: 4 },
        { itemName: "Rok", qty: 3 },
      ],
    },
    {
      outletId: jaktim.id,
      adminId: jaktimAdminId,
      items: [
        { itemName: "Sprei", qty: 2 },
        { itemName: "Handuk", qty: 3 },
        { itemName: "Jaket", qty: 2 },
        { itemName: "Kaos", qty: 1 },
      ],
    },
  ];

  // ================================
  // 3. CREATE ORDERS
  // ================================
  console.log("📝 Creating 10 pickup orders (5 per outlet)...");

  for (let i = 0; i < seedOrders.length; i++) {
    const seedOrder = seedOrders[i];
    const outletName = seedOrder.outletId === jakbar.id ? "Jakbar" : "Jaktim";

    // Pick a random customer with address
    const customer = customers[i % customers.length];
    const address = customer.customer_address[0];
    if (!address) {
      console.warn(`  ⚠ Customer ${customer.name} has no address, skipping...`);
      continue;
    }

    // 1. Pickup Request
    const pickupRequest = await prisma.pickup_Request.create({
      data: {
        customer_id: customer.id,
        address_id: address.id,
        schedulled_pickup_at: new Date(),
        assigned_outlet_id: seedOrder.outletId,
        status: Pickup_Request_Status.ARRIVED_OUTLET,
        notes: `[seed-f2] Order #${i + 1} - ${outletName}`,
      },
    });

    // 2. Order (CREATED, weight=0, price=0 — to be processed by admin)
    const order = await prisma.order.create({
      data: {
        pickup_request_id: pickupRequest.id,
        outlet_id: seedOrder.outletId,
        outlet_admin_id: seedOrder.adminId,
        total_weight: 0,
        price_total: 0,
        status: Order_Status.CREATED,
      },
    });

    // 3. Order Items
    for (const seedItem of seedOrder.items) {
      const laundryItem = itemByName(seedItem.itemName);
      await prisma.order_Item.create({
        data: {
          order_id: order.id,
          laundry_item_id: laundryItem.id,
          itemName: laundryItem.name,
          price: laundryItem.price,
          unit: laundryItem.unit,
          qty: seedItem.qty,
        },
      });
    }

    const itemSummary = seedOrder.items
      .map((it) => `${it.itemName} x${it.qty}`)
      .join(", ");
    console.log(`  ✅ Order #${i + 1} [${outletName}]: ${itemSummary}`);
  }

  console.log("✅ [seed-f2] Completed! 10 pickup orders added for outlet admin testing.");
}

main()
  .catch((e) => {
    console.error("❌ [seed-f2] Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
