import { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface Product {
  name: string;
  code: string;
  noToneName: string;
  description: string;
  urlString: string;
  discount: number;
  pictures: Array<string>;
  price: number;
  sold: number;
  category: ObjectId;
  available: Array<ObjectId>;
}

export interface ProductDocument extends Product, Document {
  totalQuantity: number;
  actualPrice: number;
  _doc: ProductDocument;
}

export type ProductModel = Model<ProductDocument>;

export type FindProductArgs = {
  noToneName?: {
    $regex: string;
  };
  category?: string;
};
