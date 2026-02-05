import { Router } from 'express';
import prisma from '../configs/db';

const router = Router();

// GET /master/laundry-items - Get all laundry item types
router.get('/laundry-items', async (req, res) => {
  try {
    const items = await prisma.laundry_Item.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ data: items });
  } catch (error) {
    console.error('Error fetching laundry items:', error);
    res.status(500).json({ message: 'Failed to fetch laundry items' });
  }
});

export const MasterRoutes = router;
