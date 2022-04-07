import { Request, Response, NextFunction } from 'express';
import { filterRequestBody } from 'services/common.service';
import Order from 'models/order.model';
import Product from 'models/product.model';
import { ProductDocument, SizeColorQuantity } from 'types/product.type';
import { OrderDocument } from 'types/order.type';
import { UnavailableError, NotFoundError } from 'services/error.service';
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

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const findArgs: {
      status?: string;
    } = {};

    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const sortBy = req.query.sortBy ? req.query.sortBy : 'createdAt';
    const status = req.query.status ? (req.query.status as string) : null;
    const order = req.query.order ? req.query.order : 'desc';
    if (status) {
      findArgs.status = status;
    }

    const orders = await Order.find(findArgs)
      .populate({ path: 'user', select: 'firstName lastName email phone' })
      .populate({ path: 'products.productId', select: 'name' })
      .skip(skip)
      .limit(limit)
      .sort([[sortBy, order]]);

    res.status(200).send({ statusCode: 200, message: 'Get orders successfully', orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const { status } = filterRequestBody(['status*'], req.body);

    const order = await Order.findById(id);

    if (!order) {
      throw new NotFoundError('Order');
    }

    order.status = status;

    await order.save();

    res.send({ statusCode: 200, message: 'Order status updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    try {
      const id = req.params.id;

      const order = (await Order.findById(id)) as OrderDocument;

      if (!order) {
        throw new NotFoundError('Order');
      }

      if (order.status === 'placed' || order.status === 'approved') {
        await Promise.all(
          order.products.map(async (product) => {
            const productDoc = (await Product.findOne({ _id: product.productId })) as ProductDocument;

            const item = productDoc.available.find((currentItem) => {
              return currentItem._id.toString() === product.item.toString();
            }) as SizeColorQuantity;

            if (item.quantity > product.quantity) {
              await Product.findOneAndUpdate(
                { _id: product.productId, 'available._id': product.item },
                {
                  $inc: {
                    'available.$.quantity': product.quantity
                  }
                },
                { upsert: true, new: true }
              );
            } else {
              throw new UnavailableError(`${productDoc.name}`);
            }
          })
        );
      }

      await Order.findByIdAndDelete(id);
    } catch (error) {
      next(error);
    }
  });

  session.endSession();
  res.send({ statusCode: 200, message: 'Delete order successfully' });
};
