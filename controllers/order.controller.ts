import { Request, Response, NextFunction } from 'express';
import { filterRequestBody } from 'services/common.service';
import mongoose from 'mongoose';
import Order from 'models/order.model';
import Product from 'models/product.model';
import { ProductDocument, SizeColorQuantity } from 'types/product.type';
import { UnavailableError } from 'services/error.service';

const validPlaceOrderKeys = ['products*', 'contactDetail*', 'user', 'vourchers', 'description'];

export const placeOrder = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    try {
      const { products } = filterRequestBody(validPlaceOrderKeys, req.body);

      const order = new Order(req.body);

      await Promise.all(
        products.map(async (product) => {
          const productDoc = (await Product.findOne({ _id: product.productId })) as ProductDocument;

          const item = productDoc.available.find((currentItem) => {
            return currentItem._id.toString() === product.item;
          }) as SizeColorQuantity;

          if (item.quantity > product.quantity) {
            await Product.findOneAndUpdate(
              { _id: product.productId, 'available._id': product.item },
              {
                $inc: {
                  'available.$.quantity': -product.quantity
                }
              },
              { upsert: true, new: true, session }
            );
          } else {
            throw new UnavailableError(`${productDoc.name}`);
          }
        })
      );

      await order.save({ session });
    } catch (error) {
      next(error);
    }
  });

  session.endSession();

  res.status(201).send({ statusCode: 201, message: 'Place order successfully' });
};
