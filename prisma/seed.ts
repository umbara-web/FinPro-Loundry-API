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
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.complaintMessage.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.driver_Task.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bypass_Request.deleteMany();
  await prisma.station_Task_Item.deleteMany();
  await prisma.station_Task.deleteMany();
  await prisma.order_Item.deleteMany();
  await prisma.order.deleteMany();
  await prisma.pickup_Request.deleteMany();
  await prisma.customer_Address.deleteMany();
  await prisma.laundry_Item.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.outlet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.registerToken.deleteMany();

  const hashedPassword = await hashPassword("password123");

  // ================================
  // 1. SEED USERS
  // ================================
  console.log("👤 Seeding users...");

  // Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "superadmin@laundryku.com",
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      phone: "081200000000",
      lat: "-6.2088",
      long: "106.8456",
      isVerified: true,
      is_email_verified: true,
    },
  });

  // Customers (5)
  const customerData = [
    {
      name: "Budi Santoso",
      email: "budi.santoso@laundryku.com",
      phone: "081234567801",
      lat: "-6.2615",
      long: "106.8106",
    },
    {
      name: "Siti Rahayu",
      email: "siti.rahayu@laundryku.com",
      phone: "081234567802",
      lat: "-6.1668",
      long: "106.7868",
    },
    {
      name: "Ahmad Wijaya",
      email: "ahmad.wijaya@laundryku.com",
      phone: "081234567803",
      lat: "-6.3650",
      long: "106.8736",
    },
    {
      name: "Dewi Lestari",
      email: "dewi.lestari@laundryku.com",
      phone: "081234567804",
      lat: "-6.2400",
      long: "106.8200",
    },
    {
      name: "Rizky Pratama",
      email: "rizky.pratama@laundryku.com",
      phone: "081234567805",
      lat: "-6.1800",
      long: "106.7900",
    },
  ];

  const customers = await Promise.all(
    customerData.map((c) =>
      prisma.user.create({
        data: {
          ...c,
          password: hashedPassword,
          role: Role.CUSTOMER,
          isVerified: true,
          is_email_verified: true,
        },
      }),
    ),
  );

  // Outlet Admins (3)
  const outletAdminData = [
    {
      name: "Admin Jaksel",
      email: "admin.jaksel@laundryku.com",
      phone: "081300000001",
      lat: "-6.2615",
      long: "106.8106",
    },
    {
      name: "Admin Jakbar",
      email: "admin.jakbar@laundryku.com",
      phone: "081300000002",
      lat: "-6.1668",
      long: "106.7868",
    },
    {
      name: "Admin Jaktim",
      email: "admin.jaktim@laundryku.com",
      phone: "081300000003",
      lat: "-6.3650",
      long: "106.8736",
    },
  ];

  const outletAdmins = await Promise.all(
    outletAdminData.map((a) =>
      prisma.user.create({
        data: {
          ...a,
          password: hashedPassword,
          role: Role.OUTLET_ADMIN,
          isVerified: true,
          is_email_verified: true,
        },
      }),
    ),
  );

  // Workers (9 - 3 per outlet)
  const workerData = [
    {
      name: "Agus Setiawan",
      email: "agus.worker1@laundryku.com",
      phone: "081400000001",
      lat: "-6.2615",
      long: "106.8106",
    },
    {
      name: "Bambang Hermawan",
      email: "bambang.worker2@laundryku.com",
      phone: "081400000002",
      lat: "-6.2615",
      long: "106.8106",
    },
    {
      name: "Cahyo Nugroho",
      email: "cahyo.worker3@laundryku.com",
      phone: "081400000003",
      lat: "-6.2615",
      long: "106.8106",
    },
    {
      name: "Dedi Kurniawan",
      email: "dedi.worker4@laundryku.com",
      phone: "081400000004",
      lat: "-6.1668",
      long: "106.7868",
    },
    {
      name: "Eko Prasetyo",
      email: "eko.worker5@laundryku.com",
      phone: "081400000005",
      lat: "-6.1668",
      long: "106.7868",
    },
    {
      name: "Fajar Ramadhan",
      email: "fajar.worker6@laundryku.com",
      phone: "081400000006",
      lat: "-6.1668",
      long: "106.7868",
    },
    {
      name: "Gunawan Saputra",
      email: "gunawan.worker7@laundryku.com",
      phone: "081400000007",
      lat: "-6.3650",
      long: "106.8736",
    },
    {
      name: "Hendra Susanto",
      email: "hendra.worker8@laundryku.com",
      phone: "081400000008",
      lat: "-6.3650",
      long: "106.8736",
    },
    {
      name: "Irwan Hidayat",
      email: "irwan.worker9@laundryku.com",
      phone: "081400000009",
      lat: "-6.3650",
      long: "106.8736",
    },
  ];

  const workers = await Promise.all(
    workerData.map((w) =>
      prisma.user.create({
        data: {
          ...w,
          password: hashedPassword,
          role: Role.WORKER,
          isVerified: true,
          is_email_verified: true,
        },
      }),
    ),
  );

  // Drivers (6 - 2 per outlet)
  const driverData = [
    {
      name: "Joko Widodo",
      email: "joko.driver1@laundryku.com",
      phone: "081500000001",
      lat: "-6.2615",
      long: "106.8106",
    },
    {
      name: "Kusuma Adi",
      email: "kusuma.driver2@laundryku.com",
      phone: "081500000002",
      lat: "-6.2615",
      long: "106.8106",
    },
    {
      name: "Lukman Hakim",
      email: "lukman.driver3@laundryku.com",
      phone: "081500000003",
      lat: "-6.1668",
      long: "106.7868",
    },
    {
      name: "Mulyono Hadi",
      email: "mulyono.driver4@laundryku.com",
      phone: "081500000004",
      lat: "-6.1668",
      long: "106.7868",
    },
    {
      name: "Nanang Kosim",
      email: "nanang.driver5@laundryku.com",
      phone: "081500000005",
      lat: "-6.3650",
      long: "106.8736",
    },
    {
      name: "Oscar Putra",
      email: "oscar.driver6@laundryku.com",
      phone: "081500000006",
      lat: "-6.3650",
      long: "106.8736",
    },
  ];

  const drivers = await Promise.all(
    driverData.map((d) =>
      prisma.user.create({
        data: {
          ...d,
          password: hashedPassword,
          role: Role.DRIVER,
          isVerified: true,
          is_email_verified: true,
        },
      }),
    ),
  );

  // ================================
  // 2. SEED OUTLETS
  // ================================
  console.log("🏪 Seeding outlets...");

  const outletData = [
    {
      name: "LaundryKu Jakarta Selatan",
      address: "Jl. Kemang Raya No. 45, Kemang, Jakarta Selatan",
      lat: "-6.2615",
      long: "106.8106",
      service_radius: 5000,
    },
    {
      name: "LaundryKu Jakarta Barat",
      address: "Jl. Grogol Raya No. 88, Grogol, Jakarta Barat",
      lat: "-6.1668",
      long: "106.7868",
      service_radius: 5000,
    },
    {
      name: "LaundryKu Jakarta Timur",
      address: "Jl. Cibubur Raya No. 123, Cibubur, Jakarta Timur",
      lat: "-6.3650",
      long: "106.8736",
      service_radius: 5000,
    },
  ];

  const outlets = await Promise.all(
    outletData.map((o) => prisma.outlet.create({ data: o })),
  );

  // ================================
  // 3. SEED SHIFTS
  // ================================
  console.log("⏰ Seeding shifts...");

  const allShifts: { id: string; outlet_id: string; name: string }[] = [];
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
    allShifts.push(shiftPagi, shiftSore);
  }

  // ================================
  // 4. SEED STAFF WITH SHIFTS
  // ================================
  console.log("👥 Seeding staff with shift assignments...");

  const staffRecords = [];
  for (let i = 0; i < 3; i++) {
    const outletShifts = allShifts.filter((s) => s.outlet_id === outlets[i].id);
    const shiftPagi = outletShifts.find((s) => s.name === "Shift Pagi")!;
    const shiftSore = outletShifts.find((s) => s.name === "Shift Sore")!;

    // Outlet Admin - Shift Pagi
    staffRecords.push(
      await prisma.staff.create({
        data: {
          outlet_id: outlets[i].id,
          staff_id: outletAdmins[i].id,
          staff_type: Staff_Type.OUTLET_ADMIN,
          shift_id: shiftPagi.id,
        },
      }),
    );

    // Workers - 2 Pagi, 1 Sore
    staffRecords.push(
      await prisma.staff.create({
        data: {
          outlet_id: outlets[i].id,
          staff_id: workers[i * 3].id,
          staff_type: Staff_Type.WORKER,
          shift_id: shiftPagi.id,
        },
      }),
      await prisma.staff.create({
        data: {
          outlet_id: outlets[i].id,
          staff_id: workers[i * 3 + 1].id,
          staff_type: Staff_Type.WORKER,
          shift_id: shiftPagi.id,
        },
      }),
      await prisma.staff.create({
        data: {
          outlet_id: outlets[i].id,
          staff_id: workers[i * 3 + 2].id,
          staff_type: Staff_Type.WORKER,
          shift_id: shiftSore.id,
        },
      }),
    );

    // Drivers - 1 Pagi, 1 Sore
    staffRecords.push(
      await prisma.staff.create({
        data: {
          outlet_id: outlets[i].id,
          staff_id: drivers[i * 2].id,
          staff_type: Staff_Type.DRIVER,
          shift_id: shiftPagi.id,
        },
      }),
      await prisma.staff.create({
        data: {
          outlet_id: outlets[i].id,
          staff_id: drivers[i * 2 + 1].id,
          staff_type: Staff_Type.DRIVER,
          shift_id: shiftSore.id,
        },
      }),
    );
  }

  // ================================
  // 5. SEED LAUNDRY ITEMS
  // ================================
  console.log("👕 Seeding laundry items...");

  const laundryItemNames = [
    "Kemeja",
    "Celana Panjang",
    "Kaos",
    "Jaket",
    "Jas",
    "Rok",
    "Dress",
    "Selimut",
    "Sprei",
    "Handuk",
  ];
  const laundryItems = await Promise.all(
    laundryItemNames.map((name) =>
      prisma.laundry_Item.create({ data: { name } }),
    ),
  );

  // ================================
  // 6. SEED CUSTOMER ADDRESSES
  // ================================
  console.log("📍 Seeding customer addresses...");

  const addressData = [
    {
      customer_id: customers[0].id,
      label: "Rumah",
      recipient_name: "Budi Santoso",
      recipient_phone: "081234567801",
      address: "Jl. Kemang Utara No. 10",
      city: "Jakarta Selatan",
      postal_code: "12730",
      lat: "-6.2600",
      long: "106.8100",
      is_primary: true,
    },
    {
      customer_id: customers[1].id,
      label: "Rumah",
      recipient_name: "Siti Rahayu",
      recipient_phone: "081234567802",
      address: "Jl. Grogol Permai No. 25",
      city: "Jakarta Barat",
      postal_code: "11450",
      lat: "-6.1660",
      long: "106.7860",
      is_primary: true,
    },
    {
      customer_id: customers[2].id,
      label: "Rumah",
      recipient_name: "Ahmad Wijaya",
      recipient_phone: "081234567803",
      address: "Jl. Cibubur Indah No. 5",
      city: "Jakarta Timur",
      postal_code: "13720",
      lat: "-6.3640",
      long: "106.8730",
      is_primary: true,
    },
    {
      customer_id: customers[3].id,
      label: "Kantor",
      recipient_name: "Dewi Lestari",
      recipient_phone: "081234567804",
      address: "Jl. Sudirman No. 100",
      city: "Jakarta Pusat",
      postal_code: "10220",
      lat: "-6.2100",
      long: "106.8200",
      is_primary: true,
    },
    {
      customer_id: customers[4].id,
      label: "Apartemen",
      recipient_name: "Rizky Pratama",
      recipient_phone: "081234567805",
      address: "Apartemen Green Bay Tower A Lt. 15",
      city: "Jakarta Utara",
      postal_code: "14450",
      lat: "-6.1050",
      long: "106.8800",
      is_primary: true,
    },
  ];

  const customerAddresses = await Promise.all(
    addressData.map((a) => prisma.customer_Address.create({ data: a })),
  );

  // ================================
  // 7. SEED PICKUP REQUESTS
  // ================================
  console.log("🚚 Seeding pickup requests...");

  const pickupRequests = [];
  const now = new Date();

  for (let i = 0; i < 20; i++) {
    const customerIndex = i % 5;
    const outletIndex = i % 3;
    const driverIndex = i % 6;

    const status =
      i < 15
        ? Pickup_Request_Status.ARRIVED_OUTLET
        : i < 17
          ? Pickup_Request_Status.PICKED_UP
          : i < 19
            ? Pickup_Request_Status.DRIVER_ASSIGNED
            : Pickup_Request_Status.WAITING_DRIVER;

    const pickupRequest = await prisma.pickup_Request.create({
      data: {
        customer_id: customers[customerIndex].id,
        address_id: customerAddresses[customerIndex].id,
        schedulled_pickup_at: randomDate(
          new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          now,
        ),
        notes: `Pickup request #${i + 1}`,
        assigned_outlet_id: outlets[outletIndex].id,
        assigned_driver_id:
          status !== Pickup_Request_Status.WAITING_DRIVER
            ? drivers[driverIndex].id
            : null,
        status: status,
      },
    });
    pickupRequests.push(pickupRequest);
  }

  // ================================
  // 8. SEED ORDERS
  // ================================
  console.log("📦 Seeding orders...");

  const orderStatuses: Order_Status[] = [
    Order_Status.CREATED,
    Order_Status.CREATED,
    Order_Status.CREATED,
    Order_Status.WAITING_PAYMENT,
    Order_Status.WAITING_PAYMENT,
    Order_Status.PAID,
    Order_Status.PAID,
    Order_Status.PAID,
    Order_Status.IN_WASHING,
    Order_Status.IN_WASHING,
    Order_Status.IN_IRONING,
    Order_Status.IN_IRONING,
    Order_Status.IN_PACKING,
    Order_Status.IN_PACKING,
    Order_Status.READY_FOR_DELIVERY,
    Order_Status.READY_FOR_DELIVERY,
    Order_Status.ON_DELIVERY,
    Order_Status.ON_DELIVERY,
    Order_Status.COMPLETED,
    Order_Status.COMPLETED,
  ];

  const orders = [];
  for (let i = 0; i < 20; i++) {
    const outletIndex = i % 3;
    const weight = Math.round((2 + Math.random() * 8) * 10) / 10;
    const pricePerKg = 7000;
    const isPaid = [
      "PAID",
      "IN_WASHING",
      "IN_IRONING",
      "IN_PACKING",
      "READY_FOR_DELIVERY",
      "ON_DELIVERY",
      "COMPLETED",
    ].includes(orderStatuses[i]);

    const order = await prisma.order.create({
      data: {
        pickup_request_id: pickupRequests[i].id,
        outlet_id: outlets[outletIndex].id,
        outlet_admin_id: outletAdmins[outletIndex].id,
        total_weight: weight,
        price_total: weight * pricePerKg,
        status: orderStatuses[i],
        paid_at: isPaid
          ? randomDate(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), now)
          : null,
      },
    });
    orders.push(order);
  }

  // ================================
  // 9. SEED ORDER ITEMS
  // ================================
  console.log("🧺 Seeding order items...");

  for (const order of orders) {
    const numItems = 2 + Math.floor(Math.random() * 3);
    const usedItems = new Set<string>();

    for (let j = 0; j < numItems; j++) {
      let item;
      do {
        item = randomItem(laundryItems);
      } while (usedItems.has(item.id));
      usedItems.add(item.id);

      await prisma.order_Item.create({
        data: {
          order_id: order.id,
          laundry_item_id: item.id,
          qty: 1 + Math.floor(Math.random() * 5),
        },
      });
    }
  }

  // ================================
  // 10. SEED STATION TASKS
  // ================================
  console.log("⚙️ Seeding station tasks...");

  const stationTasks = [];
  for (const order of orders) {
    if (
      [
        "IN_WASHING",
        "IN_IRONING",
        "IN_PACKING",
        "READY_FOR_DELIVERY",
        "ON_DELIVERY",
        "COMPLETED",
      ].includes(order.status)
    ) {
      const outletIndex = outlets.findIndex((o) => o.id === order.outlet_id);
      const outletWorkers = workers.slice(outletIndex * 3, outletIndex * 3 + 3);

      // Washing task
      const washingTask = await prisma.station_Task.create({
        data: {
          order_id: order.id,
          task_type: Station_Task_Type.WASHING,
          worker_id: randomItem(outletWorkers).id,
          status:
            order.status === "IN_WASHING"
              ? Station_Task_Status.IN_PROGRESS
              : Station_Task_Status.COMPLETED,
          finished_at: order.status !== "IN_WASHING" ? new Date() : null,
        },
      });
      stationTasks.push(washingTask);

      // Ironing task
      if (
        [
          "IN_IRONING",
          "IN_PACKING",
          "READY_FOR_DELIVERY",
          "ON_DELIVERY",
          "COMPLETED",
        ].includes(order.status)
      ) {
        const ironingTask = await prisma.station_Task.create({
          data: {
            order_id: order.id,
            task_type: Station_Task_Type.IRONING,
            worker_id: randomItem(outletWorkers).id,
            status:
              order.status === "IN_IRONING"
                ? Station_Task_Status.IN_PROGRESS
                : Station_Task_Status.COMPLETED,
            finished_at: order.status !== "IN_IRONING" ? new Date() : null,
          },
        });
        stationTasks.push(ironingTask);
      }

      // Packing task
      if (
        [
          "IN_PACKING",
          "READY_FOR_DELIVERY",
          "ON_DELIVERY",
          "COMPLETED",
        ].includes(order.status)
      ) {
        const packingTask = await prisma.station_Task.create({
          data: {
            order_id: order.id,
            task_type: Station_Task_Type.PACKING,
            worker_id: randomItem(outletWorkers).id,
            status:
              order.status === "IN_PACKING"
                ? Station_Task_Status.IN_PROGRESS
                : Station_Task_Status.COMPLETED,
            finished_at: order.status !== "IN_PACKING" ? new Date() : null,
          },
        });
        stationTasks.push(packingTask);
      }
    }
  }

  // ================================
  // 11. SEED STATION TASK ITEMS
  // ================================
  console.log("📋 Seeding station task items...");

  for (const task of stationTasks) {
    const orderItems = await prisma.order_Item.findMany({
      where: { order_id: task.order_id },
    });
    for (const item of orderItems) {
      await prisma.station_Task_Item.create({
        data: {
          station_task_id: task.id,
          laundry_item_id: item.laundry_item_id,
          qty: item.qty,
        },
      });
    }
  }

  // ================================
  // 12. SEED PAYMENTS
  // ================================
  console.log("💳 Seeding payments...");

  for (const order of orders) {
    const isPaid = [
      "PAID",
      "IN_WASHING",
      "IN_IRONING",
      "IN_PACKING",
      "READY_FOR_DELIVERY",
      "ON_DELIVERY",
      "COMPLETED",
    ].includes(order.status);

    await prisma.payment.create({
      data: {
        order_id: order.id,
        method: isPaid
          ? randomItem(["bank_transfer", "cash", "e-wallet"])
          : null,
        amount: order.price_total,
        status: isPaid ? Payment_Status.PAID : Payment_Status.PENDING,
        payment_ref: isPaid
          ? `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          : null,
        paid_at: isPaid ? order.paid_at : null,
      },
    });
  }

  // ================================
  // 13. SEED DRIVER TASKS
  // ================================
  console.log("🚗 Seeding driver tasks...");

  for (const order of orders) {
    const outletIndex = outlets.findIndex((o) => o.id === order.outlet_id);
    const outletDrivers = drivers.slice(outletIndex * 2, outletIndex * 2 + 2);

    // Pickup task
    await prisma.driver_Task.create({
      data: {
        order_id: order.id,
        driver_id: randomItem(outletDrivers).id,
        task_type: Driver_Task_Type.PICKUP,
        status: Driver_Task_Status.DONE,
      },
    });

    // Delivery task
    if (
      ["READY_FOR_DELIVERY", "ON_DELIVERY", "COMPLETED"].includes(order.status)
    ) {
      await prisma.driver_Task.create({
        data: {
          order_id: order.id,
          driver_id: randomItem(outletDrivers).id,
          task_type: Driver_Task_Type.DELIVERY,
          status:
            order.status === "COMPLETED"
              ? Driver_Task_Status.DONE
              : order.status === "ON_DELIVERY"
                ? Driver_Task_Status.IN_PROGRESS
                : Driver_Task_Status.AVAILABLE,
        },
      });
    }
  }

  // ================================
  // 14. SEED ATTENDANCE
  // ================================
  console.log("📅 Seeding attendance...");

  const today = new Date();
  today.setHours(8, 0, 0, 0);

  for (const staff of staffRecords) {
    await prisma.attendance.create({
      data: {
        staff_id: staff.staff_id,
        outlet_id: staff.outlet_id,
        shift_id: staff.shift_id!,
        check_in_at: today,
        check_out_at: null,
        status: Attendance_Status.PRESENT,
      },
    });
  }

  // ================================
  // 15. SEED NOTIFICATIONS
  // ================================
  console.log("🔔 Seeding notifications...");

  for (let i = 0; i < 10; i++) {
    const order = orders[i];
    const type =
      i % 2 === 0
        ? Notification_Type.PAYMENT_REMINDER
        : Notification_Type.PICKUP_REQUEST;

    await prisma.notification.create({
      data: {
        order_id: order.id,
        type: type,
        title:
          type === Notification_Type.PAYMENT_REMINDER
            ? "Pembayaran Menunggu"
            : "Pickup Dijadwalkan",
        body:
          type === Notification_Type.PAYMENT_REMINDER
            ? `Pesanan Anda senilai Rp ${order.price_total.toLocaleString("id-ID")} menunggu pembayaran`
            : "Driver akan segera menjemput laundry Anda",
        is_read: Math.random() > 0.5,
      },
    });
  }

  // ================================
  // 16. SEED ADDITIONAL TEST TASKS (FOR WORKER DASHBOARD TESTING)
  // ================================
  console.log("🧪 Seeding additional test tasks for Jakarta Timur...");

  const jakartaTimurOutlet = outlets[2]; // Jakarta Timur
  const jakartaTimurAdmin = outletAdmins[2];
  const jakartaTimurWorkers = workers.slice(6, 9); // Workers 7, 8, 9 (indices 6, 7, 8)
  const jakartaTimurDriver = drivers[4]; // Driver 5

  const testTaskConfigs = [
    // 3 orders in WASHING stage
    { status: Order_Status.IN_WASHING, taskType: Station_Task_Type.WASHING },
    { status: Order_Status.IN_WASHING, taskType: Station_Task_Type.WASHING },
    { status: Order_Status.IN_WASHING, taskType: Station_Task_Type.WASHING },
    // 3 orders in IRONING stage
    { status: Order_Status.IN_IRONING, taskType: Station_Task_Type.IRONING },
    { status: Order_Status.IN_IRONING, taskType: Station_Task_Type.IRONING },
    { status: Order_Status.IN_IRONING, taskType: Station_Task_Type.IRONING },
    // 3 orders in PACKING stage
    { status: Order_Status.IN_PACKING, taskType: Station_Task_Type.PACKING },
    { status: Order_Status.IN_PACKING, taskType: Station_Task_Type.PACKING },
    { status: Order_Status.IN_PACKING, taskType: Station_Task_Type.PACKING },
  ];

  for (let i = 0; i < testTaskConfigs.length; i++) {
    const config = testTaskConfigs[i];
    const customer = customers[i % customers.length];
    const address = customerAddresses[i % customerAddresses.length];
    const weight = Math.round((2 + Math.random() * 8) * 10) / 10;
    const pricePerKg = 7000;

    // Create pickup request
    const testPickupRequest = await prisma.pickup_Request.create({
      data: {
        customer_id: customer.id,
        address_id: address.id,
        schedulled_pickup_at: new Date(),
        notes: `Test pickup #${i + 1} for worker dashboard`,
        assigned_outlet_id: jakartaTimurOutlet.id,
        assigned_driver_id: jakartaTimurDriver.id,
        status: Pickup_Request_Status.ARRIVED_OUTLET,
      },
    });

    // Create order
    const testOrder = await prisma.order.create({
      data: {
        pickup_request_id: testPickupRequest.id,
        outlet_id: jakartaTimurOutlet.id,
        outlet_admin_id: jakartaTimurAdmin.id,
        total_weight: weight,
        price_total: weight * pricePerKg,
        status: config.status,
        paid_at: new Date(),
      },
    });

    // Create order items (2-4 random items)
    const numItems = 2 + Math.floor(Math.random() * 3);
    const usedItems = new Set<string>();
    for (let j = 0; j < numItems; j++) {
      let item;
      do {
        item = randomItem(laundryItems);
      } while (usedItems.has(item.id));
      usedItems.add(item.id);

      await prisma.order_Item.create({
        data: {
          order_id: testOrder.id,
          laundry_item_id: item.id,
          qty: 1 + Math.floor(Math.random() * 5),
        },
      });
    }

    // Create payment
    await prisma.payment.create({
      data: {
        order_id: testOrder.id,
        method: "bank_transfer",
        amount: testOrder.price_total,
        status: Payment_Status.PAID,
        payment_ref: `PAY-TEST-${Date.now()}-${i}`,
        paid_at: new Date(),
      },
    });

    // Create completed prior tasks if needed
    const assignedWorker = randomItem(jakartaTimurWorkers);

    if (
      config.status === Order_Status.IN_IRONING ||
      config.status === Order_Status.IN_PACKING
    ) {
      await prisma.station_Task.create({
        data: {
          order_id: testOrder.id,
          task_type: Station_Task_Type.WASHING,
          worker_id: randomItem(jakartaTimurWorkers).id,
          status: Station_Task_Status.COMPLETED,
          finished_at: new Date(),
        },
      });
    }

    if (config.status === Order_Status.IN_PACKING) {
      await prisma.station_Task.create({
        data: {
          order_id: testOrder.id,
          task_type: Station_Task_Type.IRONING,
          worker_id: randomItem(jakartaTimurWorkers).id,
          status: Station_Task_Status.COMPLETED,
          finished_at: new Date(),
        },
      });
    }

    // Create the active IN_PROGRESS task
    const activeTestTask = await prisma.station_Task.create({
      data: {
        order_id: testOrder.id,
        task_type: config.taskType,
        worker_id: assignedWorker.id,
        status: Station_Task_Status.IN_PROGRESS,
        finished_at: null,
      },
    });

    // Create station task items
    const testOrderItems = await prisma.order_Item.findMany({
      where: { order_id: testOrder.id },
    });
    for (const item of testOrderItems) {
      await prisma.station_Task_Item.create({
        data: {
          station_task_id: activeTestTask.id,
          laundry_item_id: item.laundry_item_id,
          qty: item.qty,
        },
      });
    }
  }

  console.log("✅ Database seeding completed!");
  console.log(`
📊 Seeding Summary:
- Users: 24 (1 Super Admin, 5 Customers, 3 Outlet Admins, 9 Workers, 6 Drivers)
- Outlets: 3
- Shifts: 6
- Staff: 18
- Laundry Items: 10
- Customer Addresses: 5
- Pickup Requests: 20
- Orders: 20
- Payments: 20
- Driver Tasks: ${orders.filter((o) => ["READY_FOR_DELIVERY", "ON_DELIVERY", "COMPLETED"].includes(o.status)).length + 20}
- Attendance: ${staffRecords.length}
- Notifications: 10
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
