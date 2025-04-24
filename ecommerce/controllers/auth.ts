import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'; // to generate signed token
import expressJwt from 'express-jwt'; // for authentication check
import { IUser, User } from '../models/user';
import { errorHandler } from '../helpers/dbErrorHandler';

// Define custom request types
interface AuthRequest extends Request {
  profile?: IUser;
  auth?: {
    _id: string;
  };
}

// Signup
export const signup = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const newUser = new User(req.body);
  try {
    const user = await newUser.save();
    user.salt = undefined;
    user.hashed_password = undefined;
    res.json({ user });
  } catch (err) {
    res.status(400).json({
      err: errorHandler(err)
    });
  }
};

// Signin
export const signin = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(400).json({
        error: 'User with that email does not exist. Please signup'
      });
    }

    // Check if the password matches
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: 'Email and password don’t match'
      });
    }

    // Generate a signed token with user ID and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    // Persist the token as 't' in a cookie with an expiry date
    res.cookie('t', token, { expires: new Date(Date.now() + 9999) });

    // Return response with user and token to the frontend client
    const { _id, name, role } = user;
    return res.json({ token, user: { _id, email, name, role } });
  } catch (err) {
    res.status(400).json({
      error: 'Error signing in'
    });
  }
};

// Signout
export const signout = (req: Request, res: Response): Response => {
  res.clearCookie('t');
  return res.json({ message: 'Signout success' });
};

// Require Signin
export const requireSignin = expressJwt({
  secret: process.env.JWT_SECRET as string,
  algorithms: ['HS256'],
  userProperty: 'auth'
});

// Check if the user is authenticated
export const isAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  const user =
    req.profile &&
    req.auth &&
    req.profile._id.toString() === req.auth._id.toString();
  if (!user) {
    return res.status(403).json({
      error: 'Access denied'
    });
  }
  next();
};

// Check if the user is an admin
export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  if (req.profile?.role === 0) {
    return res.status(403).json({
      error: 'Admin resource! Access denied'
    });
  }
  next();
};
