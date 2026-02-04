import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../helpers/dbErrorHandler';
import { User } from '../entity/User';
import { getManager } from 'typeorm';
import { Order } from '../entity/Order';

interface UserRequest extends Request {
  body: {
    order: Order;
  } & User;
  profile: User;
}

// Middleware to fetch user by ID
export const userById = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
  id: string
): Promise<void | Response> => {
  try {
    const repository = getManager().getRepository(User);
    const user = await repository.findOne(id);
    req.profile = user;
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'User not found'
    });
  }
};

// Read user profile
export const read = (req: UserRequest, res: Response): Response => {
  if (req.profile) {
    req.profile.hashedPassword = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
  }
  return res.status(400).json({ error: 'User profile not found' });
};

export const update = async (
  req: UserRequest,
  res: Response
): Promise<void> => {
  try {
    const userRepository = getManager().getRepository(User);
    const user = await userRepository.findOne({
      where: { id: req.profile.id }
    });
    if (!user) {
      res.status(400).json({ error: 'User not found' });
      return;
    }
    userRepository.merge(user, {
      name: req.body.name,
      email: req.body.email,
      about: req.body.about
      // Add other fields as necessary
    });
    const updatedUser = await userRepository.save(user);
    const { hashedPassword, salt, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({
      error: 'Error updating user profile',
      details: error.message
    });
  }
};

export const addOrderToUserHistory = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRepository = getManager().getRepository(User);
    const historyEntry = req.body.order.products.map((item: any) => ({
      productId: item._id,
      name: item.name,
      quantity: item.count,
      transactionId: req.body.order.transactionId,
      amount: req.body.order.amount
    }));
    const user = await userRepository.findOne({
      where: { id: req.profile.id },
      relations: ['history']
    });

    if (!user) {
      res.status(400).json({ error: 'User not found' });
      return;
    }

    user.history = [...(user.history || []), ...historyEntry];
    await userRepository.save(user);

    next();
  } catch (error) {
    res.status(500).json({
      error: 'Could not update user purchase history',
      details: error.message
    });
  }
};

export const purchaseHistory = async (
  req: UserRequest,
  res: Response
): Promise<void> => {
  try {
    const repository = getManager().getRepository(Order);
    const orders = await repository.find({
      where: { user: { id: req.profile.id } },
      relations: ['user'],
      select: ['id', 'transactionId', 'amount', 'status', 'createdAt'],
      order: { createdAt: 'DESC' }
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      error: 'Could not retrieve purchase history',
      details: error.message
    });
  }
};
