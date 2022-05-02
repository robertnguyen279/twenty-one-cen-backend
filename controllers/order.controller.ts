import { Request, Response, NextFunction } from 'express';
import { filterRequestBody } from 'services/common.service';
import Order from 'models/order.model';
import { ProductDocument } from 'types/product.type';
import { ItemDocument } from 'types/item.type';
import Item from 'models/item.model';
import { OrderDocument } from 'types/order.type';
import { VoucherDocument } from 'types/voucher.type';
import Voucher from 'models/voucher.model';
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
          const item = (await Item.findById(product.item).populate({
            path: 'product',
            select: 'name'
          })) as ItemDocument;
          if (item.quantity > product.quantity) {
            item.quantity = item.quantity - product.quantity;
            await item.save();
          } else {
            const product = item.product as ProductDocument;
            throw new UnavailableError(`${product.name}`);
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
    const order = (await Order.findById(id).populate({
      path: 'user',
      select: 'firstName lastName email phone'
    })) as OrderDocument;

    if (!order) {
      throw new NotFoundError('Order');
    }

    const orderClean = JSON.parse(JSON.stringify({ ...order._doc }));

    await Promise.all(
      orderClean.products.map(async (product, i) => {
        orderClean.products[i].item = await Item.findById(product.item).populate({
          path: 'product',
          select: 'name price discount'
        });
      })
    );

    await Promise.all(
      orderClean.vouchers.map(async (voucher, i) => {
        const voucherDoc = (await Voucher.findOne({ code: voucher }).populate({
          path: 'category',
          select: 'name'
        })) as VoucherDocument;
        orderClean.vouchers[i] = voucherDoc;
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

    if (status === 'done') {
      order.shipDate = new Date();
    }

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
            const item = (await Item.findById(product.item)) as ItemDocument;
            item.quantity = product.quantity + item.quantity;
            await item.save();
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
