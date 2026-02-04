import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../helpers/dbErrorHandler';
import { Category } from '../entity/Category';
import { getManager } from 'typeorm';

interface CategoryRequest extends Request {
  category?: Category;
}

export const categoryById = async (
  req: CategoryRequest,
  res: Response,
  next: NextFunction,
  id: string
): Promise<void | Response> => {
  try {
    const repository = getManager().getRepository(Category);
    const category = await repository.findOne(id);
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
    const { name } = req.body;
    const repository = getManager().getRepository(Category);
    const data = await repository.save({ name });
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
    const repository = getManager().getRepository(Category);
    const category = await repository.save({
      id: req.category?.id,
      name: req.body.name
    });
    return res.json(category);
  } catch (err) {
    return res.status(400).json({ error: errorHandler(err) });
  }
};

export const remove = async (
  req: CategoryRequest,
  res: Response
): Promise<Response> => {
  try {
    const { category } = req;
    const repository = getManager().getRepository(Category);
    await repository.delete(category.id);
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
    const repository = getManager().getRepository(Category);
    const data = await repository.find();
    return res.json(data);
  } catch (err) {
    return res.status(400).json({ error: errorHandler(err) });
  }
};
