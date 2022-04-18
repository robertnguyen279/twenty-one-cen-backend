import { Document, Types, Model } from 'mongoose';
import { ObjectId } from 'mongodb';

export enum Size {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL'
}

export type Picure = {
  pictureUrl: string;
  description: string;
};

export interface SizeColorQuantity {
  _id: ObjectId;
  size: Size;
  color: string;
  quantity: number;
}

export interface Product {
  name: string;
  noToneName: string;
  description: string;
  urlString: string;
  discount: number;
  pictures: Array<Picure>;
  price: number;
  sold: number;
  category: ObjectId;
  available: Types.DocumentArray<SizeColorQuantity>;
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
