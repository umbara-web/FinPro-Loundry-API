import { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import prisma from '../../configs/db';

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let { outletId } = req.query;

    // If Outlet Admin, resolve outlet_id from Staff table
    if (user.role === 'OUTLET_ADMIN') {
      const staffRecord = await prisma.staff.findFirst({
        where: { staff_id: user.userId, staff_type: 'OUTLET_ADMIN' },
      });
      outletId = staffRecord?.outlet_id || undefined;
    }

    const orders = await orderService.getAllOrders(outletId as string);
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const order = await orderService.createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await orderService.updateOrder(id, req.body);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await orderService.deleteOrder(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
};
