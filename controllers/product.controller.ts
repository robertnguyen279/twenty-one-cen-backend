import { Request, Response, NextFunction } from 'express';
import Product from 'models/product.model';
import Category from 'models/category.model';
import { filterRequestBody } from 'services/common.service';
import { MissingRequestBodyError } from 'services/error.service';
import { CategoryDocument } from 'types/category.type';
import mongoose from 'mongoose';

const createProductKeys = ['name', 'description', 'pictures', 'price', 'available', 'category'];

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, pictures, price, available, category } = filterRequestBody(createProductKeys, req.body);
    let categoryDoc: CategoryDocument | null;

    if (!category || !pictures || !available) {
      throw new MissingRequestBodyError('category | pictires | available');
    }

    const session = await mongoose.startSession();

    session.withTransaction(async () => {
      try {
        categoryDoc = await Category.findOne({ name: category });
        if (!categoryDoc) {
          categoryDoc = new Category({ name: category });
          await categoryDoc.save({ session });
        }

        const product = new Product({ name, description, pictures, price, available, category: categoryDoc._id });

        await product.save({ session });

        res.status(201).send({
          statusCode: 201,
          message: 'Create product successfully',
          product: { ...product._doc, totalQuantity: product.totalQuantity }
        });
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
};
