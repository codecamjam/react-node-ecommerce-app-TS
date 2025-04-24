import { NextFunction, Request, Response } from 'express';
import formidable, { Fields, Files, File } from 'formidable';
import fs from 'fs';
import { IProduct, Product } from '../models/product';
import mongoose from 'mongoose';
import { errorHandler } from '../helpers/dbErrorHandler';

// Extend Request to include custom properties
interface ProductRequest extends Request {
  product?: IProduct;
}

// Middleware to fetch product by ID
export const productById = async (
  req: ProductRequest,
  res: Response,
  next: NextFunction,
  id: string
): Promise<void> => {
  try {
    const product = await Product.findById(id)
      .populate('category')
      .exec();
    if (!product) {
      res.status(400).json({ error: 'Product not found' });
    }
    req.product = product;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Error fetching product' });
  }
};

// Read product
export const read = (
  req: ProductRequest,
  res: Response
): Response | void => {
  if (req.product) {
    req.product.photo = undefined;
    return res.json(req.product);
  }
  return res.status(400).json({ error: 'Product not found' });
};

// Create product
export const create = (req: Request, res: Response): void => {
  const form = new formidable.IncomingForm({ keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res
        .status(400)
        .json({ error: 'Image could not be uploaded' });
    }
    const {
      name,
      description,
      price,
      category,
      quantity,
      shipping
    } = fields;
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !quantity ||
      !shipping
    ) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const product = new Product(fields);
    if (files.photo) {
      const photo = files.photo as File;
      if (photo.size > 1000000) {
        return res
          .status(400)
          .json({ error: 'Image should be less than 1mb in size' });
      }
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type || '';
    }
    try {
      const result = await product.save();
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: errorHandler(error) });
    }
  });
};

// Remove product
export const remove = async (
  req: ProductRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.product) {
      await req.product.remove();
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(400).json({ error: 'Product not found' });
    }
  } catch (err) {
    res.status(400).json({ error: errorHandler(err) });
  }
};

export const update = (req: ProductRequest, res: Response): void => {
  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err: any, fields: Fields, files: Files) => {
    if (err) {
      return res
        .status(400)
        .json({ error: 'Image could not be uploaded' });
    }

    if (!req.product) {
      return res.status(400).json({ error: 'Product not found' });
    }

    // Manually map fields with correct types
    const product = req.product;

    if (fields.name) product.name = fields.name as string;
    if (fields.description)
      product.description = fields.description as string;
    if (fields.price) product.price = parseFloat(fields.price as string);
    if (fields.category)
      product.category = new mongoose.Types.ObjectId(
        fields.category as string
      );
    if (fields.quantity)
      product.quantity = parseInt(fields.quantity as string, 10);
    if (fields.shipping)
      product.shipping = fields.shipping === 'true' ? true : false;

    if (files.photo) {
      const photo = files.photo as File;
      if (photo.size > 1000000) {
        return res.status(400).json({
          error: 'Image should be less than 1mb in size'
        });
      }

      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type || '';
    }

    try {
      const result = await product.save();
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: errorHandler(error) });
    }
  });
};
export const list = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const order = (req.query.order as string) || 'asc';
  const sortBy = (req.query.sortBy as string) || '_id';
  const limit = req.query.limit
    ? parseInt(req.query.limit as string, 10)
    : 6;

  try {
    const products = await Product.find()
      .select('-photo')
      .populate('category')
      .sort({ [sortBy]: order })
      .limit(limit);
    return res.json(products);
  } catch (err) {
    return res.status(400).json({ error: 'Products not found' });
  }
};

export const listRelated = async (
  req: ProductRequest,
  res: Response
): Promise<Response> => {
  const limit = req.query.limit
    ? parseInt(req.query.limit as string, 10)
    : 6;

  try {
    const products = await Product.find({
      _id: { $ne: req.product._id },
      category: req.product.category
    })
      .limit(limit)
      .populate('category', '_id name');

    return res.json(products);
  } catch (err) {
    return res.status(400).json({ error: 'Products not found' });
  }
};

export const listCategories = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const categories = await Product.distinct('category').exec();
    return res.json(categories);
  } catch (err) {
    return res.status(400).json({ error: 'Products not found' });
  }
};

export const listBySearch = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const order = req.body.order || 'desc';
  const sortBy = req.body.sortBy || '_id';
  const limit = req.body.limit ? parseInt(req.body.limit, 10) : 100;
  const skip = req.body.skip ? parseInt(req.body.skip, 10) : 0;
  const findArgs: Record<string, any> = {};

  for (const key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === 'price') {
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1]
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  try {
    const data = await Product.find(findArgs)
      .select('-photo')
      .populate('category')
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit);

    return res.json({ size: data.length, data });
  } catch (err) {
    return res.status(400).json({ error: 'Products not found' });
  }
};

export const photo = (
  req: ProductRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.product?.photo?.data) {
    res.set('Content-Type', req.product.photo.contentType);
    res.send(req.product.photo.data);
  } else {
    next();
  }
};

export const listSearch = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const query: Record<string, any> = {};

  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' };

    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    try {
      const products = await Product.find(query).select('-photo');
      return res.json(products);
    } catch (err) {
      return res.status(400).json({ error: errorHandler(err) });
    }
  }
  return res.status(400).json({ error: 'No search query provided' });
};

export const decreaseQuantity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  const bulkOps = req.body.order.products.map((item: any) => ({
    updateOne: {
      filter: { _id: item._id },
      update: { $inc: { quantity: -item.count, sold: +item.count } }
    }
  }));

  try {
    await Product.bulkWrite(bulkOps, {});
    next();
  } catch (error) {
    return res.status(400).json({ error: 'Could not update product' });
  }
};
