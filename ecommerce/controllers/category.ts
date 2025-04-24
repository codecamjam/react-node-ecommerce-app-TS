import { Request, Response, NextFunction } from 'express';
import Category, { ICategory } from '../models/category';
import { errorHandler } from '../helpers/dbErrorHandler';

interface CategoryRequest extends Request {
  category?: ICategory;
}

export const categoryById = async (
  req: CategoryRequest,
  res: Response,
  next: NextFunction,
  id: string
): Promise<void | Response> => {
  try {
    const category = await Category.findById(id).exec();
    if (!category) {
      return res.status(400).json({ error: 'Category does not exist' });
    }
    req.category = category;
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Could not retrieve category' });
  }
};

export const create = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const category = new Category(req.body);
    const data = await category.save();
    return res.json({ data });
  } catch (err) {
    return res.status(400).json({ error: errorHandler(err) });
  }
};

export const read = (req: CategoryRequest, res: Response): Response => {
  return res.json(req.category);
};

export const update = async (
  req: CategoryRequest,
  res: Response
): Promise<Response> => {
  try {
    const category = req.category;
    category.name = req.body.name;
    const data = await category.save();
    return res.json(data);
  } catch (err) {
    return res.status(400).json({ error: errorHandler(err) });
  }
};

export const remove = async (
  req: CategoryRequest,
  res: Response
): Promise<Response> => {
  try {
    const category: ICategory = req.category;
    await category.remove();
    return res.json({ message: 'Category deleted' });
  } catch (err) {
    return res.status(400).json({ error: errorHandler(err) });
  }
};

export const list = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const data = await Category.find().exec();
    return res.json(data);
  } catch (err) {
    return res.status(400).json({ error: errorHandler(err) });
  }
};
