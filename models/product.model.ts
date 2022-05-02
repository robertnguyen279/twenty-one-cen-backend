import { Schema, model, models, Types } from 'mongoose';
import { ProductDocument, ProductModel } from 'types/product.type';
import { removeVietnameseTones, transformNameToUrl } from 'services/common.service';

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    code: {
      type: String,
      required: true
    },
    noToneName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    urlString: {
      type: String,
      required: true,
      unique: true
    },
    category: {
      type: Types.ObjectId,
      required: true,
      ref: 'Category'
    },
    pictures: {
      type: Array
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    sold: {
      type: Number,
      min: 0
    },
    available: [
      {
        type: Types.ObjectId,
        ref: 'Item'
      }
    ]
  },
  { timestamps: true }
);

productSchema.pre('validate', function (next): void {
  this.noToneName = removeVietnameseTones(this.name);
  if (!this.urlString) {
    this.urlString = transformNameToUrl(this.noToneName);
  }

  next();
});

productSchema.virtual('totalQuantity').get(function (): string {
  return this.available.reduce((sum, current) => sum + current.quantity, 0);
});

productSchema.virtual('actualPrice').get(function (): number {
  return this.price - (this.price * this.discount) / 100;
});

const Product = (models.Product as ProductModel) || model<ProductDocument, ProductModel>('Product', productSchema);

export default Product;
