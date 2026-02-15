import {
  PrismaClient,
  Role,
  Staff_Type,
  ItemCategory,
  ItemUnit,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("🌱 [seed-fresh] Starting fresh laundry seed...");

  // ================================
  // 0. CLEAR ALL DATA
  // ================================
  console.log("🧹 Clearing existing data...");
  const tablenames = [
    "ComplaintMessage",
    "Complaint",
    "Notification",
    "Driver_Task",
    "Payment",
    "Bypass_Request",
    "Station_Task_Item",
    "Station_Task",
    "Order_Item",
    "Order",
    "Pickup_Request",
    "Customer_Address",
    "Laundry_Item",
    "Attendance",
    "Staff",
    "Shift",
    "Outlet",
    "User",
    "RegisterToken",
  ];

  for (const tableName of tablenames) {
    try {
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "${tableName}" CASCADE;`
      );
    } catch (error) {
      console.log(`  ⚠ Could not truncate ${tableName}, skipping`);
    }
  }

  const hashedPassword = await hashPassword("password123");

  // ================================
  // 1. OUTLETS (2)
  // ================================
  console.log("🏪 Seeding 2 outlets...");

  const jakbar = await prisma.outlet.create({
    data: {
      name: "LaundryKu Jakarta Barat",
      address: "Jl. Grogol Raya No. 88, Grogol, Jakarta Barat",
      city: "Jakarta Barat",
      manager: "Admin Jakbar",
      phone: "021-5551234",
      lat: "-6.1668",
      long: "106.7868",
      service_radius: 5000,
      openTime: "08:00 - 21:00",
    },
  });

  const jaktim = await prisma.outlet.create({
    data: {
      name: "LaundryKu Jakarta Timur",
      address: "Jl. Cibubur Raya No. 123, Cibubur, Jakarta Timur",
      city: "Jakarta Timur",
      manager: "Admin Jaktim",
      phone: "021-5555678",
      lat: "-6.3650",
      long: "106.8736",
      service_radius: 5000,
      openTime: "08:00 - 21:00",
    },
  });

  // ================================
  // 2. SUPER ADMINS (2)
  // ================================
  console.log("👑 Seeding 2 super admins...");

  await prisma.user.create({
    data: {
      name: "Aditya Pratama",
      email: "superadmin1@fl.com",
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      phone: "081200000001",
      lat: "-6.2088",
      long: "106.8456",
      isVerified: true,
      is_email_verified: true,
    },
  });

  await prisma.user.create({
    data: {
      name: "Bintang Nugraha",
      email: "superadmin2@fl.com",
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      phone: "081200000002",
      lat: "-6.2088",
      long: "106.8456",
      isVerified: true,
      is_email_verified: true,
    },
  });

  // ================================
  // 3. SHIFTS (2 per outlet = 4 total)
  // ================================
  console.log("⏰ Seeding shifts...");

  const jakbarShiftPagi = await prisma.shift.create({
    data: { outlet_id: jakbar.id, name: "Shift Pagi", start_time: "07:00", end_time: "15:00" },
  });
  const jakbarShiftSore = await prisma.shift.create({
    data: { outlet_id: jakbar.id, name: "Shift Sore", start_time: "15:00", end_time: "23:00" },
  });
  const jaktimShiftPagi = await prisma.shift.create({
    data: { outlet_id: jaktim.id, name: "Shift Pagi", start_time: "07:00", end_time: "15:00" },
  });
  const jaktimShiftSore = await prisma.shift.create({
    data: { outlet_id: jaktim.id, name: "Shift Sore", start_time: "15:00", end_time: "23:00" },
  });

  // ================================
  // 4. OUTLET STAFF (1 admin + 1 worker + 1 driver per outlet)
  // ================================
  console.log("👥 Seeding outlet staff...");

  // --- Jakbar Staff ---
  const jakbarAdmin = await prisma.user.create({
    data: {
      name: "Andi Saputra",
      email: "admin@fljakbar.com",
      password: hashedPassword,
      role: Role.OUTLET_ADMIN,
      phone: "081300000001",
      lat: "-6.1668",
      long: "106.7868",
      isVerified: true,
      is_email_verified: true,
    },
  });

  const jakbarWorker = await prisma.user.create({
    data: {
      name: "Cici Paramida",
      email: "worker@fljakbar.com",
      password: hashedPassword,
      role: Role.WORKER,
      phone: "081400000001",
      lat: "-6.1668",
      long: "106.7868",
      isVerified: true,
      is_email_verified: true,
    },
  });

  const jakbarDriver = await prisma.user.create({
    data: {
      name: "Feri Irawan",
      email: "driver@fljakbar.com",
      password: hashedPassword,
      role: Role.DRIVER,
      phone: "081500000001",
      lat: "-6.1668",
      long: "106.7868",
      isVerified: true,
      is_email_verified: true,
    },
  });

  // --- Jaktim Staff ---
  const jaktimAdmin = await prisma.user.create({
    data: {
      name: "Marni Sumarni",
      email: "admin@fljaktim.com",
      password: hashedPassword,
      role: Role.OUTLET_ADMIN,
      phone: "081300000002",
      lat: "-6.3650",
      long: "106.8736",
      isVerified: true,
      is_email_verified: true,
    },
  });

  const jaktimWorker = await prisma.user.create({
    data: {
      name: "Ojak Surojak",
      email: "worker@fljaktim.com",
      password: hashedPassword,
      role: Role.WORKER,
      phone: "081400000002",
      lat: "-6.3650",
      long: "106.8736",
      isVerified: true,
      is_email_verified: true,
    },
  });

  const jaktimDriver = await prisma.user.create({
    data: {
      name: "Rudi Salam",
      email: "driver@fljaktim.com",
      password: hashedPassword,
      role: Role.DRIVER,
      phone: "081500000002",
      lat: "-6.3650",
      long: "106.8736",
      isVerified: true,
      is_email_verified: true,
    },
  });

  // ================================
  // 5. STAFF RECORDS (link user ↔ outlet ↔ shift)
  // ================================
  console.log("🔗 Linking staff to outlets and shifts...");

  // Jakbar
  await prisma.staff.create({
    data: { outlet_id: jakbar.id, staff_id: jakbarAdmin.id, staff_type: Staff_Type.OUTLET_ADMIN, shift_id: jakbarShiftPagi.id },
  });
  await prisma.staff.create({
    data: { outlet_id: jakbar.id, staff_id: jakbarWorker.id, staff_type: Staff_Type.WORKER, shift_id: jakbarShiftPagi.id },
  });
  await prisma.staff.create({
    data: { outlet_id: jakbar.id, staff_id: jakbarDriver.id, staff_type: Staff_Type.DRIVER, shift_id: jakbarShiftPagi.id },
  });

  // Jaktim
  await prisma.staff.create({
    data: { outlet_id: jaktim.id, staff_id: jaktimAdmin.id, staff_type: Staff_Type.OUTLET_ADMIN, shift_id: jaktimShiftPagi.id },
  });
  await prisma.staff.create({
    data: { outlet_id: jaktim.id, staff_id: jaktimWorker.id, staff_type: Staff_Type.WORKER, shift_id: jaktimShiftPagi.id },
  });
  await prisma.staff.create({
    data: { outlet_id: jaktim.id, staff_id: jaktimDriver.id, staff_type: Staff_Type.DRIVER, shift_id: jaktimShiftPagi.id },
  });

  // ================================
  // 6. LAUNDRY ITEMS (10)
  // ================================
  console.log("👕 Seeding 10 laundry items...");

  const laundryItemData = [
    { name: "Kemeja", category: ItemCategory.SATUAN, unit: ItemUnit.PCS, price: 15000 },
    { name: "Celana Panjang", category: ItemCategory.SATUAN, unit: ItemUnit.PCS, price: 20000 },
    { name: "Kaos", category: ItemCategory.CUCI_SETRIKA, unit: ItemUnit.KG, price: 7000 },
    { name: "Jaket", category: ItemCategory.SATUAN, unit: ItemUnit.PCS, price: 25000 },
    { name: "Jas", category: ItemCategory.DRY_CLEAN, unit: ItemUnit.PCS, price: 50000 },
    { name: "Rok", category: ItemCategory.SATUAN, unit: ItemUnit.PCS, price: 15000 },
    { name: "Dress", category: ItemCategory.DRY_CLEAN, unit: ItemUnit.PCS, price: 45000 },
    { name: "Selimut", category: ItemCategory.SATUAN, unit: ItemUnit.PCS, price: 30000 },
    { name: "Sprei", category: ItemCategory.SATUAN, unit: ItemUnit.PCS, price: 25000 },
    { name: "Handuk", category: ItemCategory.CUCI_SETRIKA, unit: ItemUnit.KG, price: 7000 },
  ];

  await Promise.all(
    laundryItemData.map((item) =>
      prisma.laundry_Item.create({ data: item })
    )
  );

  // ================================
  // 7. CUSTOMERS (1 per outlet = 2 total) + ADDRESSES
  // ================================
  console.log("🧑 Seeding 2 customers with addresses...");

  // Customer Jakbar
  const customerJakbar = await prisma.user.create({
    data: {
      name: "Hani Handayani",
      email: "hani.customer@fl.com",
      password: hashedPassword,
      role: Role.CUSTOMER,
      phone: "081600000001",
      lat: "-6.1600",
      long: "106.7800",
      isVerified: true,
      is_email_verified: true,
    },
  });

  await prisma.customer_Address.create({
    data: {
      customer_id: customerJakbar.id,
      label: "Rumah",
      recipient_name: "Hani Handayani",
      recipient_phone: "081600000001",
      address: "Jl. Kebon Jeruk No. 15, Jakarta Barat",
      city: "Jakarta Barat",
      postal_code: "11530",
      lat: "-6.1600",
      long: "106.7800",
      is_primary: true,
    },
  });

  // Customer Jaktim
  const customerJaktim = await prisma.user.create({
    data: {
      name: "Tina Marlina",
      email: "tina.customer@fl.com",
      password: hashedPassword,
      role: Role.CUSTOMER,
      phone: "081600000002",
      lat: "-6.3600",
      long: "106.8700",
      isVerified: true,
      is_email_verified: true,
    },
  });

  await prisma.customer_Address.create({
    data: {
      customer_id: customerJaktim.id,
      label: "Rumah",
      recipient_name: "Tina Marlina",
      recipient_phone: "081600000002",
      address: "Jl. Raya Cibubur No. 50, Jakarta Timur",
      city: "Jakarta Timur",
      postal_code: "13720",
      lat: "-6.3600",
      long: "106.8700",
      is_primary: true,
    },
  });

  // ================================
  // SUMMARY
  // ================================
  console.log("");
  console.log("✅ [seed-fresh] Seeding completed! Fresh laundry ready.");
  console.log("================================================");
  console.log("📊 Summary:");
  console.log("   🏪 2 Outlets (Jakbar, Jaktim)");
  console.log("   👑 2 Super Admins");
  console.log("   👔 2 Outlet Admins (1/outlet)");
  console.log("   👷 2 Workers (1/outlet)");
  console.log("   🚗 2 Drivers (1/outlet)");
  console.log("   🧑 2 Customers (1/outlet) + addresses");
  console.log("   👕 10 Laundry Items");
  console.log("   ⏰ 4 Shifts (2/outlet)");
  console.log("   📦 0 Orders (fresh start!)");
  console.log("================================================");
  console.log("🔑 Password semua akun: password123");
  console.log("================================================");
}

main()
  .catch((e) => {
    console.error("❌ [seed-fresh] Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
