import {
  PrismaClient,
  Role,
  Staff_Type,
  Attendance_Status,
  Pickup_Request_Status,
  Order_Status,
  Station_Task_Type,
  Station_Task_Status,
  Payment_Status,
  Driver_Task_Type,
  Driver_Task_Status,
  Notification_Type,
  Bypass_Request_Status,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function createFullOrderFlow(
  outlet: any,
  worker: any | null,
  admins: any[],
  customers: any[],
  laundryItems: any[],
  targetTaskType: Station_Task_Type,
  targetStatus: Station_Task_Status
) {
  const customer = randomItem(customers);
  const address = await prisma.customer_Address.findFirst({
    where: { customer_id: customer.id },
  });
  const admin = randomItem(admins);
  const item = randomItem(laundryItems);
  const qty = Math.floor(Math.random() * 5) + 3; // 3-7 items
  const weight = Math.floor(Math.random() * 3) + 2; // 2-4 kg

  // 1. Pickup Request
  const pr = await prisma.pickup_Request.create({
    data: {
      customer_id: customer.id,
      address_id: address!.id,
      schedulled_pickup_at: new Date(),
      assigned_outlet_id: outlet.id,
      status: Pickup_Request_Status.ARRIVED_OUTLET,
      notes: `Seeded Task - ${targetTaskType} - ${worker ? "Active" : "Unclaimed"}`,
    },
  });

  // Determine Order Status based on Task
  let orderStatus: Order_Status = Order_Status.IN_WASHING;
  if (targetTaskType === Station_Task_Type.IRONING) orderStatus = Order_Status.IN_IRONING;
  if (targetTaskType === Station_Task_Type.PACKING) orderStatus = Order_Status.IN_PACKING;

  // 2. Order
  const order = await prisma.order.create({
    data: {
      pickup_request_id: pr.id,
      outlet_id: outlet.id,
      outlet_admin_id: admin.id,
      total_weight: weight,
      price_total: weight * 7000,
      status: orderStatus,
      paid_at: new Date(),
    },
  });

  // 3. Order Items
  await prisma.order_Item.create({
    data: {
      order_id: order.id,
      laundry_item_id: item.id,
      qty: qty,
      itemName: item.name,
      price: item.price,
      unit: "PCS",
    },
  });

  // 4. Payment
  await prisma.payment.create({
    data: {
      order_id: order.id,
      method: "CASH",
      amount: weight * 7000,
      status: Payment_Status.PAID,
      paid_at: new Date(),
    },
  });

  // 5. Previous Tasks (Completed)
  const createCompletedTask = async (type: Station_Task_Type) => {
    const task = await prisma.station_Task.create({
      data: {
        order_id: order.id,
        task_type: type,
        worker_id: null,
        started_at: new Date(),
        finished_at: new Date(),
        status: Station_Task_Status.COMPLETED,
      },
    });

    await prisma.station_Task_Item.create({
      data: {
        station_task_id: task.id,
        laundry_item_id: item.id,
        qty: qty
      }
    });
  };

  if (targetTaskType === Station_Task_Type.IRONING) {
    await createCompletedTask(Station_Task_Type.WASHING);
  }
  if (targetTaskType === Station_Task_Type.PACKING) {
    await createCompletedTask(Station_Task_Type.WASHING);
    await createCompletedTask(Station_Task_Type.IRONING);
  }

  // 6. Target Task
  const targetTask = await prisma.station_Task.create({
    data: {
      order_id: order.id,
      task_type: targetTaskType,
      worker_id: worker ? worker.id : null,
      status: targetStatus,
      started_at: targetStatus === Station_Task_Status.IN_PROGRESS ? new Date() : undefined,
    },
  });

  await prisma.station_Task_Item.create({
    data: {
      station_task_id: targetTask.id,
      laundry_item_id: item.id,
      qty: qty,
    },
  });
}

async function seedDriverTasks(
  outlet: any,
  customers: any[],
  admins: any[],
  laundryItems: any[]
) {
  console.log(`--- Seeding driver tasks for ${outlet.name} ---`);
  const admin = randomItem(admins);

  // 1. Pickup Tasks (3 Unclaimed)
  console.log("  > Creating 3 unclaimed PICKUP tasks...");
  for (let i = 0; i < 3; i++) {
    const customer = randomItem(customers);
    const address = await prisma.customer_Address.findFirst({ where: { customer_id: customer.id } });

    // Pickup Request
    const pr = await prisma.pickup_Request.create({
      data: {
        customer_id: customer.id,
        address_id: address!.id,
        schedulled_pickup_at: new Date(),
        assigned_outlet_id: outlet.id,
        status: Pickup_Request_Status.WAITING_DRIVER,
        notes: `Seeded Driver Task - PICKUP #${i + 1}`
      }
    });

    // Order (Required by Driver Task schema relation)
    const order = await prisma.order.create({
      data: {
        pickup_request_id: pr.id,
        outlet_id: outlet.id,
        outlet_admin_id: admin.id,
        total_weight: 0, // Not weighed yet
        price_total: 0,
        status: Order_Status.CREATED,
      }
    });

    // Driver Task
    await prisma.driver_Task.create({
      data: {
        order_id: order.id,
        task_type: Driver_Task_Type.PICKUP,
        status: Driver_Task_Status.AVAILABLE,
        driver_id: null
      }
    });
  }

  // 2. Delivery Tasks (3 Unclaimed)
  console.log("  > Creating 3 unclaimed DELIVERY tasks...");
  for (let i = 0; i < 3; i++) {
    const customer = randomItem(customers);
    const address = await prisma.customer_Address.findFirst({ where: { customer_id: customer.id } });
    const item = randomItem(laundryItems);
    const qty = 5;
    const weight = 3;

    // Pickup Request (Already done)
    const pr = await prisma.pickup_Request.create({
      data: {
        customer_id: customer.id,
        address_id: address!.id,
        schedulled_pickup_at: new Date(),
        assigned_outlet_id: outlet.id,
        status: Pickup_Request_Status.PICKED_UP, // Past state
        notes: `Seeded Driver Task - DELIVERY #${i + 1}`
      }
    });

    // Order (Ready for delivery)
    const order = await prisma.order.create({
      data: {
        pickup_request_id: pr.id,
        outlet_id: outlet.id,
        outlet_admin_id: admin.id,
        total_weight: weight,
        price_total: weight * 7000,
        status: Order_Status.READY_FOR_DELIVERY,
        paid_at: new Date(),
      }
    });

    // Order Items
    await prisma.order_Item.create({
      data: {
        order_id: order.id,
        laundry_item_id: item.id,
        qty: qty,
        itemName: item.name,
        price: item.price,
        unit: "PCS",
      },
    });

    // Payment
    await prisma.payment.create({
      data: {
        order_id: order.id,
        method: "CASH",
        amount: weight * 7000,
        status: Payment_Status.PAID,
        paid_at: new Date(),
      },
    });

    // Driver Task
    await prisma.driver_Task.create({
      data: {
        order_id: order.id,
        task_type: Driver_Task_Type.DELIVERY,
        status: Driver_Task_Status.AVAILABLE,
        driver_id: null
      }
    });
  }
}

async function seedOutletTasks(
  outlet: any,
  workers: any[],
  admins: any[],
  customers: any[],
  laundryItems: any[]
) {
  console.log(`--- Seeding tasks for ${outlet.name} ---`);

  // 1. Active Tasks (1 per worker)
  console.log(`  > Assigning active tasks to ${workers.length} workers...`);
  const stationTypes = [Station_Task_Type.WASHING, Station_Task_Type.IRONING, Station_Task_Type.PACKING];

  for (let i = 0; i < workers.length; i++) {
    const worker = workers[i];
    const taskType = stationTypes[i % stationTypes.length]; // Round robin

    await createFullOrderFlow(outlet, worker, admins, customers, laundryItems, taskType, Station_Task_Status.IN_PROGRESS);
  }

  // 2. Unclaimed Tasks (2 per station type)
  console.log(`  > Creating 2 unclaimed tasks per station...`);
  for (const type of stationTypes) {
    for (let i = 0; i < 2; i++) {
      await createFullOrderFlow(outlet, null, admins, customers, laundryItems, type, Station_Task_Status.PENDING);
    }
  }
}

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data
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
      console.log(`Could not truncate ${tableName}, trying deleteMany`);
      // Fallback if truncate fails (e.g. permission issues)
      // @ts-ignore
      if (prisma[tableName.toLowerCase()] || prisma[tableName]) {
        // @ts-ignore
        const model = prisma[tableName.toLowerCase()] || prisma[tableName];
        if (model) await model.deleteMany();
      }
    }
  }

  const hashedPassword = await hashPassword("password123");

  // ================================
  // 1. SEED OUTLETS
  // ================================
  console.log("🏪 Seeding outlets...");

  const outletData = [
    {
      name: "LaundryKu Jakarta Barat",
      code: "jakbar",
      address: "Jl. Grogol Raya No. 88, Grogol, Jakarta Barat",
      lat: "-6.1668",
      long: "106.7868",
      service_radius: 5000,
    },
    {
      name: "LaundryKu Jakarta Timur",
      code: "jaktim",
      address: "Jl. Cibubur Raya No. 123, Cibubur, Jakarta Timur",
      lat: "-6.3650",
      long: "106.8736",
      service_radius: 5000,
    },
  ];

  const outlets = await Promise.all(
    outletData.map((o) =>
      prisma.outlet.create({
        data: {
          name: o.name,
          address: o.address,
          lat: o.lat,
          long: o.long,
          service_radius: o.service_radius,
        },
      })
    )
  );

  const outletMap: Record<string, typeof outlets[0]> = {};
  outlets.forEach((o, index) => {
    outletMap[outletData[index].code] = o;
  });

  // ================================
  // 2. SEED USERS
  // ================================
  console.log("👤 Seeding users...");

  // Super Admin
  await prisma.user.create({
    data: {
      name: "Aditya Pratama",
      email: "aditya.superadmin@fl.com",
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      phone: "081200000000",
      lat: "-6.2088",
      long: "106.8456",
      isVerified: true,
      is_email_verified: true,
    },
  });

  // Helper to create users
  const createUsers = async (users: any[], role: Role, outletCode?: string) => {
    const createdUsers = [];
    for (const u of users) {
      const email = outletCode
        ? `${u.name.split(" ")[0].toLowerCase()}.${role.toLowerCase()}@fl${outletCode}.com`
        : u.email; // Fallback or custom logic if needed, but per plan mostly consistent

      const user = await prisma.user.create({
        data: {
          name: u.name,
          email: u.email, // Using the email directly from the object map below
          password: hashedPassword,
          role: role,
          phone: "0812" + Math.floor(Math.random() * 100000000),
          lat: "-6.2000",
          long: "106.8000",
          isVerified: true,
          is_email_verified: true,
        },
      });
      createdUsers.push(user);
    }
    return createdUsers;
  };

  // --- Jakarta Barat Users ---
  const jakbarAdmins = await createUsers([
    { name: "Andi Saputra", email: "andi.admin@fljakbar.com" },
    { name: "Budi Santoso", email: "budi.admin@fljakbar.com" }
  ], Role.OUTLET_ADMIN);

  const jakbarWorkers = await createUsers([
    { name: "Cici Paramida", email: "cici.worker@fljakbar.com" },
    { name: "Dodi Mulyadi", email: "dodi.worker@fljakbar.com" },
    { name: "Eko Patrio", email: "eko.worker@fljakbar.com" }
  ], Role.WORKER);

  const jakbarDrivers = await createUsers([
    { name: "Feri Irawan", email: "feri.driver@fljakbar.com" },
    { name: "Gito Rollies", email: "gito.driver@fljakbar.com" }
  ], Role.DRIVER);

  const jakbarCustomers = await createUsers([
    { name: "Hani Handayani", email: "hani.customer@fljakbar.com" },
    { name: "Ida Iasha", email: "ida.customer@fljakbar.com" },
    { name: "Joko Anwar", email: "joko.customer@fljakbar.com" },
    { name: "Kiki Fatmala", email: "kiki.customer@fljakbar.com" },
    { name: "Lila Sari", email: "lila.customer@fljakbar.com" }
  ], Role.CUSTOMER);

  // --- Jakarta Timur Users ---
  const jaktimAdmins = await createUsers([
    { name: "Marni Sumarni", email: "marni.admin@fljaktim.com" },
    { name: "Nina Tamam", email: "nina.admin@fljaktim.com" }
  ], Role.OUTLET_ADMIN);

  const jaktimWorkers = await createUsers([
    { name: "Ojak Surojak", email: "ojak.worker@fljaktim.com" },
    { name: "Purnomo Sidi", email: "purnomo.worker@fljaktim.com" },
    { name: "Qomarudin", email: "qomar.worker@fljaktim.com" }
  ], Role.WORKER);

  const jaktimDrivers = await createUsers([
    { name: "Rudi Salam", email: "rudi.driver@fljaktim.com" },
    { name: "Sandi Sandoro", email: "sandi.driver@fljaktim.com" }
  ], Role.DRIVER);

  const jaktimCustomers = await createUsers([
    { name: "Tina Toon", email: "tina.customer@fljaktim.com" },
    { name: "Usman Harun", email: "usman.customer@fljaktim.com" },
    { name: "Vera Wang", email: "vera.customer@fljaktim.com" },
    { name: "Wawan Kurniawan", email: "wawan.customer@fljaktim.com" },
    { name: "Xena Warrior", email: "xena.customer@fljaktim.com" }
  ], Role.CUSTOMER);


  // ================================
  // 3. SEED SHIFTS
  // ================================
  console.log("⏰ Seeding shifts...");
  const shifts: any[] = [];

  for (const outlet of outlets) {
    const shiftPagi = await prisma.shift.create({
      data: {
        outlet_id: outlet.id,
        name: "Shift Pagi",
        start_time: "07:00",
        end_time: "15:00",
      },
    });
    const shiftSore = await prisma.shift.create({
      data: {
        outlet_id: outlet.id,
        name: "Shift Sore",
        start_time: "15:00",
        end_time: "23:00",
      },
    });
    shifts.push({ outletId: outlet.id, pagi: shiftPagi, sore: shiftSore });
  }

  // ================================
  // 4. SEED STAFF & ATTENDANCE
  // ================================
  console.log("👥 Seeding staff and attendance...");

  const assignStaff = async (user: any, outlet: any, type: Staff_Type, shift: any) => {
    await prisma.staff.create({
      data: {
        outlet_id: outlet.id,
        staff_id: user.id,
        staff_type: type,
        shift_id: shift.id,
      },
    });

    // Check in for today
    const today = new Date();
    today.setHours(8, 0, 0, 0);
    await prisma.attendance.create({
      data: {
        staff_id: user.id,
        outlet_id: outlet.id,
        shift_id: shift.id,
        check_in_at: today,
        status: Attendance_Status.PRESENT,
      },
    });
  };

  // Function to find shift
  const getShifts = (outletCode: string) => {
    const outlet = outletMap[outletCode];
    return shifts.find(s => s.outletId === outlet.id);
  };

  // Jakbar Assignments
  const jakbarShifts = getShifts("jakbar");
  await assignStaff(jakbarAdmins[0], outletMap["jakbar"], Staff_Type.OUTLET_ADMIN, jakbarShifts.pagi);
  await assignStaff(jakbarAdmins[1], outletMap["jakbar"], Staff_Type.OUTLET_ADMIN, jakbarShifts.sore);

  await assignStaff(jakbarWorkers[0], outletMap["jakbar"], Staff_Type.WORKER, jakbarShifts.pagi);
  await assignStaff(jakbarWorkers[1], outletMap["jakbar"], Staff_Type.WORKER, jakbarShifts.pagi);
  await assignStaff(jakbarWorkers[2], outletMap["jakbar"], Staff_Type.WORKER, jakbarShifts.sore);

  await assignStaff(jakbarDrivers[0], outletMap["jakbar"], Staff_Type.DRIVER, jakbarShifts.pagi);
  await assignStaff(jakbarDrivers[1], outletMap["jakbar"], Staff_Type.DRIVER, jakbarShifts.sore);

  // Jaktim Assignments
  const jaktimShifts = getShifts("jaktim");
  await assignStaff(jaktimAdmins[0], outletMap["jaktim"], Staff_Type.OUTLET_ADMIN, jaktimShifts.pagi);
  await assignStaff(jaktimAdmins[1], outletMap["jaktim"], Staff_Type.OUTLET_ADMIN, jaktimShifts.sore);

  await assignStaff(jaktimWorkers[0], outletMap["jaktim"], Staff_Type.WORKER, jaktimShifts.pagi);
  await assignStaff(jaktimWorkers[1], outletMap["jaktim"], Staff_Type.WORKER, jaktimShifts.pagi);
  await assignStaff(jaktimWorkers[2], outletMap["jaktim"], Staff_Type.WORKER, jakbarShifts.sore);

  await assignStaff(jaktimDrivers[0], outletMap["jaktim"], Staff_Type.DRIVER, jaktimShifts.pagi);
  await assignStaff(jaktimDrivers[1], outletMap["jaktim"], Staff_Type.DRIVER, jaktimShifts.sore);

  // ================================
  // 5. SEED LAUNDRY ITEMS
  // ================================
  console.log("👕 Seeding laundry items...");
  const laundryItemNames = [
    "Kemeja", "Celana Panjang", "Kaos", "Jaket", "Jas",
    "Rok", "Dress", "Selimut", "Sprei", "Handuk"
  ];
  const laundryItems = await Promise.all(
    laundryItemNames.map((name) =>
      prisma.laundry_Item.create({ data: { name, price: 10000, category: "SATUAN", unit: "PCS" } }) // Simplified
    )
  );

  // ================================
  // 6. SEED CUSTOMER ADDRESSES
  // ================================
  console.log("📍 Seeding customer addresses...");
  const allCustomers = [...jakbarCustomers, ...jaktimCustomers];

  for (const customer of allCustomers) {
    await prisma.customer_Address.create({
      data: {
        customer_id: customer.id,
        label: "Rumah",
        recipient_name: customer.name,
        recipient_phone: customer.phone || "0812345678",
        address: "Jl. Contoh No. 1",
        city: "Jakarta",
        postal_code: "12345",
        lat: "-6.2000",
        long: "106.8000",
        is_primary: true,
      }
    });
  }

  // ================================
  // 7. SEED BYPASS REQUESTS
  // ================================
  console.log("🚧 Seeding bypass requests...");

  const bypassScenarios = [
    { type: Station_Task_Type.WASHING, reason: "Jumlah baju yang diterima kurang 1 dari data awal" },
    { type: Station_Task_Type.IRONING, reason: "Terdapat kelebihan 2 pcs kaos kaki yang tidak terdata" },
    { type: Station_Task_Type.PACKING, reason: "Jumlah item tidak sesuai, ada item yang tertukar" }
  ];

  for (const scenario of bypassScenarios) {
    // Create necessary data structure to support a bypass request
    const customer = jaktimCustomers[0]; // Use Jaktim customer
    const address = await prisma.customer_Address.findFirst({ where: { customer_id: customer.id } });
    const outlet = outletMap["jaktim"];
    const worker = jaktimWorkers[0]; // Assign to Ojak

    // 1. Pickup Request and Order
    const pr = await prisma.pickup_Request.create({
      data: {
        customer_id: customer.id,
        address_id: address!.id,
        schedulled_pickup_at: new Date(),
        assigned_outlet_id: outlet.id,
        status: Pickup_Request_Status.ARRIVED_OUTLET,
      }
    });

    const order = await prisma.order.create({
      data: {
        pickup_request_id: pr.id,
        outlet_id: outlet.id,
        outlet_admin_id: jaktimAdmins[0].id,
        total_weight: 5,
        price_total: 35000,
        status: Order_Status.IN_WASHING, // Simplified status for bypass creation
      }
    });

    // 2. Order Items
    const item = laundryItems[0];
    await prisma.order_Item.create({
      data: {
        order_id: order.id,
        laundry_item_id: item.id,
        qty: 5,
        itemName: item.name,
        price: item.price,
        unit: "PCS"
      }
    });

    // 3. Station Task
    const task = await prisma.station_Task.create({
      data: {
        order_id: order.id,
        task_type: scenario.type,
        worker_id: worker.id,
        status: Station_Task_Status.IN_PROGRESS, // Must be in progress to have bypass request usually
      }
    });

    // 4. Station Task Item
    await prisma.station_Task_Item.create({
      data: {
        station_task_id: task.id,
        laundry_item_id: item.id,
        qty: 5,
      }
    });

    // 5. Bypass Request
    await prisma.bypass_Request.create({
      data: {
        station_task_id: task.id,
        outlet_admin_id: jaktimAdmins[0].id,
        reason: scenario.reason,
        status: Bypass_Request_Status.PENDING,
      }
    });
  }

  // ================================
  // 8. SEED WORKER TASKS (ACTIVE & UNCLAIMED)
  // ================================
  console.log("👷 Seeding worker tasks (Active & Unclaimed)...");

  await seedOutletTasks(
    outletMap["jakbar"],
    jakbarWorkers,
    jakbarAdmins,
    jakbarCustomers,
    laundryItems
  );

  await seedOutletTasks(
    outletMap["jaktim"],
    jaktimWorkers,
    jaktimAdmins,
    jaktimCustomers,
    laundryItems
  );

  // ================================
  // 9. SEED DRIVER TASKS (UNCLAIMED)
  // ================================
  console.log("🚚 Seeding driver tasks (Unclaimed)...");

  await seedDriverTasks(
    outletMap["jakbar"],
    jakbarCustomers,
    jakbarAdmins,
    laundryItems
  );

  await seedDriverTasks(
    outletMap["jaktim"],
    jaktimCustomers,
    jaktimAdmins,
    laundryItems
  );

  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
