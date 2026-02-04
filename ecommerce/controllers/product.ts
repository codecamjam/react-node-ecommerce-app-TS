import { NextFunction, Request, Response } from 'express';
import formidable, { Fields, Files, File } from 'formidable';
import fs from 'fs';
import { getManager, Like, Not } from 'typeorm';
import { errorHandler } from '../helpers/dbErrorHandler';
import { Product } from '../entity/Product';
import { Category } from '../entity/Category';

// Extend Request to include custom properties
interface ProductRequest extends Request {
  product?: Product;
}

// Get a product by ID
export const productById = async (
  req: ProductRequest,
  res: Response,
  next: any,
  id: string
): Promise<void> => {
  const productRepository = getManager().getRepository(Product);
  try {
    const product = await productRepository.findOne(id, {
      relations: ['category']
    });
    if (!product) {
      res.status(400).json({ error: 'Product not found' });
      return;
    }
    req.product = product;
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Read product
export const read = (
  req: ProductRequest,
  res: Response
): Response | void => {
  if (req.product) {
    req.product.photoData = undefined;
    req.product.photoContentType = undefined;
    return res.json(req.product);
  }
  return res.status(400).json({ error: 'Product not found' });
};

export const create = async (
  req: Request,
  res: Response
): Promise<void> => {
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

    const productRepository = getManager().getRepository(Product);

    const product = new Product();
    product.name = name as string;
    product.description = description as string;
    product.price = parseFloat(price as string);
    product.category = {
      id: parseInt(category as string, 10)
    } as Category; // fixed here
    product.quantity = parseInt(quantity as string, 10);
    product.shipping = shipping === 'true';

    if (files.photo) {
      const photo = files.photo as File;
      if (photo.size > 1000000) {
        return res
          .status(400)
          .json({ error: 'Image should be less than 1mb in size' });
      }
      product.photoData = fs.readFileSync(photo.path);
      product.photoContentType = photo.type || '';
    }

    try {
      const savedProduct = await productRepository.save(product);
      res.json(savedProduct);
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
      const repository = getManager().getRepository(Product);
      await repository.delete(req.product.id);
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

    const productRepository = getManager().getRepository(Product);
    const product = req.product;

    if (fields.name) product.name = fields.name as string;
    if (fields.description)
      product.description = fields.description as string;
    if (fields.price) product.price = parseFloat(fields.price as string);
    if (fields.category)
      product.category = {
        id: parseInt(fields.category as string, 10)
      } as Category;
    if (fields.quantity)
      product.quantity = parseInt(fields.quantity as string, 10);
    if (fields.shipping) product.shipping = fields.shipping === 'true';

    if (files.photo) {
      const photo = files.photo as File;
      if (photo.size > 1000000) {
        return res.status(400).json({
          error: 'Image should be less than 1mb in size'
        });
      }

      product.photoData = fs.readFileSync(photo.path);
      product.photoContentType = photo.type || '';
    }

    try {
      const result = await productRepository.save(product);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
};

export const list = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const order =
    (req.query.order as 'ASC' | 'DESC')?.toUpperCase() || 'ASC';
  const sortBy = (req.query.sortBy as string) || 'id';
  const limit = req.query.limit
    ? parseInt(req.query.limit as string, 10)
    : 6;

  const productRepository = getManager().getRepository(Product);

  try {
    const products = await productRepository.find({
      select: [
        'id',
        'name',
        'description',
        'price',
        'quantity',
        'shipping',
        'createdAt',
        'updatedAt'
      ], // excluding photo fields explicitly
      relations: ['category'],
      order: { [sortBy]: order },
      take: limit
    });

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

  const productRepository = getManager().getRepository(Product);

  try {
    const products = await productRepository.find({
      where: {
        id: Not(req.product.id),
        category: { id: req.product.category.id }
      },
      relations: ['category'],
      take: limit
    });

    return res.json(products);
  } catch (err) {
    return res.status(400).json({ error: 'Products not found' });
  }
};

export const listCategories = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const categoryRepository = getManager().getRepository(Category);

  try {
    const categories = await categoryRepository.find();
    return res.json(categories);
  } catch (err) {
    return res.status(400).json({ error: 'Categories not found' });
  }
};

export const listBySearch = async (
  req: ProductRequest,
  res: Response
): Promise<Response> => {
  const order = req.body.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const sortBy = req.body.sortBy || 'id';
  const limit = req.body.limit ? parseInt(req.body.limit, 10) : 100;
  const skip = req.body.skip ? parseInt(req.body.skip, 10) : 0;

  const productRepository = getManager().getRepository(Product);
  const queryBuilder = productRepository
    .createQueryBuilder('product')
    .leftJoinAndSelect('product.category', 'category');

  const filters = req.body.filters;

  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key].length > 0) {
        if (key === 'price') {
          queryBuilder.andWhere('product.price BETWEEN :min AND :max', {
            min: filters[key][0],
            max: filters[key][1]
          });
        } else {
          queryBuilder.andWhere(`product.${key} IN (:...${key})`, {
            [key]: filters[key]
          });
        }
      }
    });
  }

  try {
    const [data, total] = await queryBuilder
      .orderBy(`product.${sortBy}`, order)
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return res.json({ size: total, data });
  } catch (err) {
    return res.status(400).json({ error: 'Products not found' });
  }
};

export const photo = (
  req: ProductRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.product?.photoData) {
    res.set('Content-Type', req.product.photoContentType);
    res.send(req.product.photoData);
  } else {
    next();
  }
};

export const listSearch = async (
  req: ProductRequest,
  res: Response
): Promise<Response> => {
  const search = req.query.search as string;
  const category = req.query.category as string;

  if (!search) {
    return res.status(400).json({ error: 'No search query provided' });
  }

  const productRepository = getManager().getRepository(Product);

  const whereCondition: any = {
    name: Like(`%${search}%`)
  };

  if (category && category !== 'All') {
    whereCondition.category = { id: parseInt(category, 10) };
  }

  try {
    const products = await productRepository.find({
      where: whereCondition,
      relations: ['category'],
      select: [
        'id',
        'name',
        'description',
        'price',
        'quantity',
        'shipping',
        'createdAt',
        'updatedAt'
      ] // exclude photo explicitly
    });

    return res.json(products);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const decreaseQuantity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  const productRepository = getManager().getRepository(Product);

  try {
    for (const item of req.body.order.products) {
      await productRepository
        .createQueryBuilder()
        .update(Product)
        .set({
          quantity: () => `quantity - ${item.count}`,
          sold: () => `sold + ${item.count}`
        })
        .where('id = :id', { id: item._id })
        .execute();
    }

    next();
  } catch (error) {
    return res.status(400).json({ error: 'Could not update product' });
  }
};
