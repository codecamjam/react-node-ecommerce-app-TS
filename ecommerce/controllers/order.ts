import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../helpers/dbErrorHandler';
import { getManager } from 'typeorm';
import { Order } from '../entity/Order';
import { User } from '../entity/User';

interface OrderRequest extends Request {
  order?: Order;
  profile?: User;
}

export const orderById = async (
  req: OrderRequest,
  res: Response,
  next: NextFunction,
  id: string
): Promise<void> => {
  try {
    const orderRepository = getManager().getRepository(Order);
    const order = await orderRepository.findOne({
      where: { id },
      relations: ['products', 'products.product']
    });
    if (!order) {
      res.status(400).json({ error: 'Order not found' });
      return;
    }
    req.order = order;
    next();
  } catch (error) {
    res
      .status(500)
      .json({ error: errorHandler(error), details: error.message });
  }
};

export const create = async (
  req: OrderRequest,
  res: Response
): Promise<void> => {
  try {
    const orderRepository = getManager().getRepository(Order);
    const order = orderRepository.create({
      ...req.body.order,
      user: req.profile
    });
    const savedOrder = await orderRepository.save(order);
    res.json(savedOrder);
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error),
      details: error.message
    });
  }
};

export const listOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const orderRepository = getManager().getRepository(Order);
    const orders = await orderRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });

    res.json(orders);
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error),
      details: error.message
    });
  }
};

export const getStatusValues = (req: Request, res: Response): void => {
  res.json([
    'Not processed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled'
  ]);
};

export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const orderRepository = getManager().getRepository(Order);
    const order = await orderRepository.findOne({ id: req.body.orderId });
    if (!order) {
      res.status(400).json({ error: 'Order not found' });
      return;
    }
    order.status = req.body.status;
    const updatedOrder = await orderRepository.save(order);
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error),
      details: error.message
    });
  }
};
