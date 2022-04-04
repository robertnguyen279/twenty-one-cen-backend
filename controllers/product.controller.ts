import { Request, Response, NextFunction } from 'express';
import Product from 'models/product.model';
import Category from 'models/category.model';
import { filterRequestBody, parseQueryText } from 'services/common.service';
import { CategoryDocument } from 'types/category.type';
import mongoose from 'mongoose';
import { ProductDocument } from 'types/product.type';
import { NotFoundError } from 'services/error.service';

const createProductKeys = ['name', 'description', 'pictures*', 'price', 'available*', 'category*'];
const updateProductKeys = ['name', 'description', 'pictures', 'price', 'available', 'category'];

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();

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

      const product = new Product({ name, description, pictures, price, available, category: categoryDoc._id });

      await product.save({ session });
    } catch (error) {
      next(error);
    }
  });
  session.endSession();

  res.status(201).send({
    statusCode: 201,
    message: 'Create product successfully'
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
        console.log(category);

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

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const product = await Product.findById(id).populate({ path: 'category', select: 'name' }).select('-noToneName');

    if (!product) {
      throw new NotFoundError('Product');
    }

    res.send({
      statusCode: 200,
      message: 'Get product by id successfully',
      product: { ...product._doc, totalQuantity: product.totalQuantity }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find().populate({ path: 'category', select: 'name' }).select('-noToneName');

    res.send({ statusCode: 200, message: 'Get all products successfully', products });
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
    const products = await Product.find({ noToneName: { $regex: parseQueryText(text as string) } })
      .limit(limit)
      .skip(skip)
      .populate({ path: 'category', select: 'name' })
      .sort([[sortBy, order]])
      .select('-noToneName');

    res.send({ statusCode: 200, message: 'Get products successfully', products });
  } catch (error) {
    next(error);
  }
};
