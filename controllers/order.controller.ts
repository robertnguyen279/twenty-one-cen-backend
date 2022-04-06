import { Request, Response, NextFunction } from 'express';
import { filterRequestBody } from 'services/common.service';
import Order from 'models/order.model';
import Product from 'models/product.model';
import { ProductDocument, SizeColorQuantity } from 'types/product.type';
import { OrderDocument } from 'types/order.type';
import { UnavailableError } from 'services/error.service';
import mongoose from 'mongoose';

const validPlaceOrderKeys = ['products*', 'contactDetail*', 'user', 'vouchers', 'description'];

export const placeOrder = async (req: Request, res: Response, next: NextFunction) => {
  const orderId = new mongoose.Types.ObjectId();

  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    try {
      const { products } = filterRequestBody(validPlaceOrderKeys, req.body);
      const order = new Order({ _id: orderId, ...req.body });
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
              { upsert: true, new: true }
            );
          } else {
            throw new UnavailableError(`${productDoc.name}`);
          }
        })
      );

      await order.save();
    } catch (error) {
      next(error);
    }
  });
  session.endSession();
  res.status(201).send({ statusCode: 201, message: 'Place order successfully', orderId });
};

export const getAnOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const order = (await Order.findById(id)
      .populate({ path: 'user', select: 'firstName lastName email phone' })
      .populate({ path: 'products.productId', select: 'name' })) as OrderDocument;

    const orderClean = JSON.parse(JSON.stringify({ ...order._doc }));

    await Promise.all(
      orderClean.products.map(async (product, i) => {
        const productDoc = (await Product.findOne({ _id: product.productId })) as ProductDocument;
        const item = productDoc.available.id(product.item);
        orderClean.products[i].item = item;
      })
    );

    res.send({ statusCode: 200, message: 'Get an order successfully', order: orderClean });
  } catch (error) {
    next(error);
  }
};
