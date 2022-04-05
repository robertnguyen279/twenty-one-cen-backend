import { Document, Model } from 'mongoose';
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

export type SizeQuantity = {
  size: Size;
  quantity: number;
};

export interface Product {
  name: string;
  noToneName: string;
  description: string;
  urlString: string;
  pictures: Array<Picure>;
  price: number;
  sold: number;
  category: ObjectId;
  available: Array<SizeQuantity>;
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
