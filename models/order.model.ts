import { Schema, model, models, Types } from 'mongoose';
import { OrderDocument, OrderModel } from 'types/order.type';
import { ProductDocument } from 'types/product.type';
import { VoucherDocument } from 'types/voucher.type';
import validator from 'validator';
import Product from 'models/product.model';
import Voucher from 'models/voucher.model';

const orderSchema = new Schema(
  {
    products: [
      {
        productId: {
          type: Types.ObjectId,
          ref: 'Product'
        },
        quantity: {
          type: Number,
          required: true
        },
        item: {
          type: Types.ObjectId,
          subRef: 'Product.available'
        }
      }
    ],
    user: {
      type: Types.ObjectId,
      ref: 'User'
    },
    contactDetail: {
      phone: {
        type: Number,
        required: true,
        validate: {
          validator: (phone: number) => {
            return validator.isMobilePhone(phone.toString(), ['vi-VN']);
          },
          message: 'Phone is invalid'
        }
      },
      district: {
        type: String
      },
      province: {
        type: String,
        required: true
      },
      addressDetail: {
        type: String,
        required: true
      },
      firstName: {
        type: String,
        required: true
      },
      lastName: {
        type: String,
        required: true
      }
    },
    vouchers: [
      {
        type: Types.ObjectId,
        ref: 'Voucher'
      }
    ],
    description: {
      type: String
    },
    shipDate: {
      type: Date
    },
    totalPrice: {
      type: Number,
      required: true
    },
    orderDate: {
      type: Date,
      default: Date.now()
    },
    status: {
      type: String,
      enum: ['placed', 'approved', 'done'],
      default: 'placed'
    }
  },
  { timestamps: true }
);

orderSchema.pre('validate', async function (next): Promise<void> {
  let discount = 0;
  const productPrice = await this.products.reduce(async (sum, current) => {
    const product = (await Product.findOne({ _id: current.productId })) as ProductDocument;
    return (await sum) + product.price * current.quantity;
  }, 0);

  if (this.vouchers) {
    discount = await this.vouchers.reduce(async (sum, current) => {
      const voucher = (await Voucher.findOne({ _id: current })) as VoucherDocument;
      return (await sum) + voucher.discount;
    }, 0);
  }

  this.totalPrice = productPrice - (productPrice * discount) / 100;
  next();
});

const Order = (models.Order as OrderModel) || model<OrderDocument, OrderModel>('Order', orderSchema);

export default Order;
