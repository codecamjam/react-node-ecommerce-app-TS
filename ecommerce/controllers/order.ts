import { Request, Response, NextFunction } from 'express';
import { IOrder, Order } from '../models/order';
import { errorHandler } from '../helpers/dbErrorHandler';
import { IUser } from '../models/user';

interface OrderRequest extends Request {
  order?: IOrder;
  profile?: IUser;
}

// Middleware to fetch order by ID
export const orderById = async (
  req: OrderRequest,
  res: Response,
  next: NextFunction,
  id: string
): Promise<void> => {
  try {
    const order = await Order.findById(id)
      .populate('products.product', 'name price')
      .exec();
    if (!order) {
      res.status(400).json({
        error: 'Order not found'
      });
      return;
    }
    req.order = order; // Attach the order to the request object
    next();
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error)
    });
  }
};

// Create a new order
export const create = async (
  req: OrderRequest,
  res: Response
): Promise<void> => {
  try {
    req.body.order.user = req.profile;
    const order = new Order(req.body.order);
    const data = await order.save();
    res.json(data);
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error)
    });
  }
};

// List all orders
export const listOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const orders = await Order.find()
      .populate('user', '_id name address')
      .sort('-created')
      .exec();
    res.json(orders);
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error)
    });
  }
};

// Get status values for orders
export const getStatusValues = (req: Request, res: Response): void => {
  res.json((Order.schema.path('status') as any).enumValues);
};

// Update order status
export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const order = await Order.findByIdAndUpdate(
      { _id: req.body.orderId },
      { $set: { status: req.body.status } },
      { new: true }
    ).exec();
    if (!order) {
      res.status(400).json({
        error: 'Order not found'
      });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({
      error: errorHandler(error)
    });
  }
};
