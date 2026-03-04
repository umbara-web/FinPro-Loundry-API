const fs = require('fs');

const replaces = [
  {
    file: 'src/admin/services/address.service.ts',
    ops: [{ o: "created_at: 'desc'", n: "createdAt: 'desc'" }],
  },
  {
    file: 'src/admin/services/order.service.ts',
    ops: [{ o: "created_at: 'desc'", n: "createdAt: 'desc'" }],
  },
  {
    file: 'src/admin/services/outlet.service.ts',
    ops: [{ o: "created_at: 'desc'", n: "createdAt: 'desc'" }],
  },
  {
    file: 'src/admin/services/worker.service.ts',
    ops: [{ o: "created_at: 'desc'", n: "createdAt: 'desc'" }],
  },
  {
    file: 'src/modules/address/address.service.ts',
    ops: [{ o: "created_at: 'desc'", n: "createdAt: 'desc'" }],
  },
  {
    file: 'src/modules/complaint/complaint-message.service.ts',
    ops: [{ o: "created_at: 'asc'", n: "createdAt: 'asc'" }],
  },
  {
    file: 'src/modules/order/order.repository.ts',
    ops: [{ o: 'updated_at: {', n: 'updatedAt: {' }],
  },
  {
    file: 'src/modules/order/order.query.helper.ts',
    ops: [
      {
        o: 'created_at: Prisma.SortOrder.desc',
        n: 'createdAt: Prisma.SortOrder.desc',
      },
      {
        o: 'created_at: Prisma.SortOrder.desc',
        n: 'createdAt: Prisma.SortOrder.desc',
      },
    ],
  },
  {
    file: 'src/modules/payment/payment.service.ts',
    ops: [{ o: '      amount,', n: '      amount: amount || 0,' }],
  },
  {
    file: 'src/modules/pickup/pickup.repository.ts',
    ops: [
      { o: 'orderData.order_item =', n: 'orderData.order_items =' },
      { o: "created_at: 'desc'", n: "createdAt: 'desc'" },
    ],
  },
  {
    file: 'src/services/driver.service.ts',
    ops: [
      { o: "updated_at: 'desc'", n: "updatedAt: 'desc'" },
      { o: "finished_at: 'desc'", n: "finished_at: 'desc'" }, // left as is, because I added finished_at to schema!
      { o: /p\.order/g, n: 'p.orders' },
      { o: 'd.order.updated_at', n: 'd.order.updatedAt' },
    ],
  },
  {
    file: 'src/services/outlet-admin.service.ts',
    ops: [
      {
        o: 'req.station_task.station_task_item',
        n: 'req.station_task.station_task_items',
      },
      { o: 'order.order_item.find', n: 'order.order_items.find' },
      { o: 'created_at: {', n: 'createdAt: {' },
      { o: 'created_at: {', n: 'createdAt: {' },
    ],
  },
  {
    file: 'src/services/worker.service.ts',
    ops: [
      { o: 'task.order.pickup_request', n: 'task.orders[0]?.pickup_request' },
      { o: 'task.order.order_item', n: 'task.orders[0]?.order_items' },
      {
        o: 'order: { include: { order_item: true } }',
        n: 'orders: { include: { order_items: true } }',
      },
    ],
  },
];

replaces.forEach((r) => {
  let content = fs.readFileSync(r.file, 'utf8');
  let original = content;
  r.ops.forEach((op) => {
    if (typeof op.o === 'string') {
      content = content.replaceAll(op.o, op.n);
    } else {
      content = content.replace(op.o, op.n);
    }
  });
  if (original !== content) {
    fs.writeFileSync(r.file, content);
    console.log(`Updated ${r.file}`);
  }
});
