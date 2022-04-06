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
          ref: 'Product.available'
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
        type: String
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
  const productsPrice = await this.products.reduce(async (sum, current) => {
    const product = (await Product.findOne({ _id: current.productId })) as ProductDocument;
    const productFinalPrice = await Order.calculateProductPrice(product, this.vouchers);
    return (await sum) + productFinalPrice * current.quantity;
  }, 0);
  this.totalPrice = productsPrice < 0 ? 0 : productsPrice;
  next();
});

orderSchema.statics.calculateProductPrice = async function (
  product: ProductDocument,
  vouchers: Array<VoucherDocument>
): Promise<number> {
  let totalDiscount = product.discount | 0;

  const voucherDocs = await Voucher.find({ code: { $in: vouchers } });

  if (voucherDocs.length) {
    voucherDocs.map((voucher) => {
      if (voucher.expiresIn > new Date()) {
        if (voucher.category && voucher.category?.toString() === product.category.toString()) {
          totalDiscount += voucher.discount;
        } else if (!voucher.category) {
          totalDiscount += voucher.discount;
        }
      }
    });
  }

  return product.price - (product.price * totalDiscount) / 100;
};

const Order = (models.Order as OrderModel) || model<OrderDocument, OrderModel>('Order', orderSchema);

export default Order;
