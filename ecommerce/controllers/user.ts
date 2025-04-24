import { Request, Response, NextFunction } from 'express';
import { Document } from 'mongoose';
import { IUser, User } from '../models/user';
import { ICartItem, IOrder, Order } from '../models/order';
import { errorHandler } from '../helpers/dbErrorHandler';

interface AuthRequest extends Request {
  body: {
    order: IOrder;
  };
  profile: IUser;
}

// Middleware to fetch user by ID
export const userById = (
  req: Request,
  res: Response,
  next: NextFunction,
  id: string
): void => {
  User.findById(id).exec((err, user: Document<IUser> | null) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found'
      });
    }
    req['profile'] = user;
    next();
  });
};

// Read user profile
export const read = (req: AuthRequest, res: Response): Response => {
  if (req.profile) {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
  }
  return res.status(400).json({ error: 'User profile not found' });
};

// Update user profile
export const update = (req: AuthRequest, res: Response): void => {
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true },
    (err, user: IUser | null) => {
      if (err || !user) {
        return res.status(400).json({
          error: 'You are not authorized to perform this action'
        });
      }
      user.hashed_password = undefined;
      user.salt = undefined;
      res.json(user);
    }
  );
};

// Add order to user history
export const addOrderToUserHistory = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const history = req.body.order.products.map((item: ICartItem) => ({
    _id: item._id,
    name: item.name,
    quantity: item.count,
    transaction_id: req.body.order.transaction_id,
    amount: req.body.order.amount
  }));

  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { history } },
    { new: true },
    error => {
      if (error) {
        return res.status(400).json({
          error: 'Could not update user purchase history'
        });
      }
      next();
    }
  );
};

// Get user purchase history
export const purchaseHistory = (req: AuthRequest, res: Response): void => {
  Order.find({ user: req.profile._id })
    .populate('user', '_id name')
    .sort('-created')
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      res.json(orders);
    });
};
