import express, { Request, Response } from 'express';
import { requireSignin, isAuth, isAdmin } from '../controllers/auth';
import {
  userById,
  read,
  update,
  purchaseHistory
} from '../controllers/user';

const router = express.Router();

// Route to access a secret endpoint
router.get(
  '/secret/:userId',
  requireSignin,
  isAuth,
  isAdmin,
  (req: Request, res: Response) => {
    res.json({ user: req['profile '] });
  }
);

// Route to get user details
router.get('/user/:userId', requireSignin, isAuth, read);

// Route to update user details
router.put('/user/:userId', requireSignin, isAuth, update);

// Route to get purchase history of a user
router.get(
  '/orders/by/user/:userId',
  requireSignin,
  isAuth,
  purchaseHistory
);

// Middleware to handle userId parameter
router.param('userId', userById);

export default router;
