import { Request, Response, NextFunction } from 'express';
import Product from 'models/product.model';
import Category from 'models/category.model';
import { filterRequestBody, parseQueryText } from 'services/common.service';
import { CategoryDocument } from 'types/category.type';
import mongoose from 'mongoose';
import { ProductDocument, FindProductArgs } from 'types/product.type';
import { NotFoundError } from 'services/error.service';

const createProductKeys = ['name', 'description', 'pictures*', 'price', 'available*', 'category*', 'discount'];
const updateProductKeys = ['name', 'description', 'pictures', 'price', 'available', 'category', 'discount'];

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  const productId = new mongoose.Types.ObjectId();

  await session.withTransaction(async () => {
    try {
      const { name, description, pictures, price, available, category } = filterRequestBody(
        createProductKeys,
        req.body
      );

      let categoryDoc: CategoryDocument | null;

      categoryDoc = await Category.findOne({ name: category });
      if (!categoryDoc) {
        categoryDoc = new Category({ name: category });
        await categoryDoc.save({ session });
      }

      const product = new Product({
        _id: productId,
        name,
        description,
        pictures,
        price,
        available,
        category: categoryDoc._id
      });

      await product.save({ session });
    } catch (error) {
      next(error);
    }
  });

  session.endSession();

  res.status(201).send({
    statusCode: 201,
    message: 'Create product successfully',
    productId
  });
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    try {
      const id = req.params.id;
      filterRequestBody(updateProductKeys, req.body);

      const product = (await Product.findById(id)) as ProductDocument;

      if (req.body.category) {
        let category: CategoryDocument | null;
        category = await Category.findOne({ name: req.body.category });
        if (!category) {
          category = new Category({ name: req.body.category });
          await category.save({ session });
        }

        product.category = category._id;
      }

      for (const key in req.body) {
        if (key !== 'category') {
          product[key] = req.body[key];
        }
      }

      await product.save({ session });
    } catch (error) {
      next(error);
    }
  });
  session.endSession();

  res.status(201).send({
    statusCode: 201,
    message: 'Update product successfully'
  });
};

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find().populate({ path: 'category', select: 'name' }).select('-noToneName');

    res.send({ statusCode: 200, message: 'Get all products successfully', count: products.length, products });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const doc = await Product.findByIdAndDelete(id);

    if (!doc) {
      throw new NotFoundError('Product');
    }

    res.send({ statusCode: 200, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const text = req.query.text ? req.query.text : '';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
    const sortBy = req.query.sortBy ? req.query.sortBy : 'createdAt';
    const order = req.query.order ? req.query.order : 'desc';
    const category = req.query.category ? req.query.category : null;

    const findProductArgs: FindProductArgs = {};

    findProductArgs.noToneName = { $regex: parseQueryText(text as string) };

    if (category) {
      findProductArgs.category = category as string;
    }

    const products = await Product.find(findProductArgs)
      .limit(limit)
      .skip(skip)
      .populate({ path: 'category', select: 'name' })
      .sort([[sortBy, order]])
      .select('-noToneName');

    res.send({ statusCode: 200, message: 'Get products successfully', count: products.length, products });
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.find();

    res.send({ statusCode: 200, message: 'Get all categories successfully', categories });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    try {
      const id = req.params.id;

      await Product.deleteMany({ category: id }, { session });
      await Category.findOneAndDelete({ _id: id }, { session });
    } catch (error) {
      next(error);
    }
  });
  session.endSession();

  res.status(200).send({ statusCode: 200, message: 'Delete category successfully' });
};

export const getByUrlString = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const urlString = req.params.urlString;

    const product = await Product.findOne({ urlString })
      .populate({ path: 'category', select: 'name' })
      .select('-noToneName');

    if (!product) {
      throw new NotFoundError('Product');
    }

    res.send({
      statusCode: 200,
      message: 'Get product successfully',
      product: { ...product._doc, actualPrice: product.actualPrice, totalQuantity: product.totalQuantity }
    });
  } catch (error) {
    next(error);
  }
};

export const countAvailable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const product = await Product.findById(id);

    const size = req.query.size ? (req.query.size as string) : '';
    const color = req.query.color ? (req.query.color as string) : '';

    const filterAvailable = product?.available.filter((item) => item.size.includes(size) && item.color.includes(color));

    const countAvailable = filterAvailable?.reduce((sum, current) => sum + current.quantity, 0);

    res.send({ statusCode: 200, message: 'Get count product successfully', count: countAvailable });
  } catch (error) {
    next(error);
  }
};
