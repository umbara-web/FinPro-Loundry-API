import prisma from '../../configs/db';

export class LaundryItemService {
  static async getAll() {
    return prisma.laundry_Item.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
