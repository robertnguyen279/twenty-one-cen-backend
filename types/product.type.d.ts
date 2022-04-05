import { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';

export enum Size {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL'
}

export enum Color {
  blue = 'blue',
  red = 'red',
  green = 'green',
  purple = 'purple',
  black = 'black',
  pink = 'pink',
  yellow = 'yellow',
  orange = 'orange',
  white = 'white',
  brown = 'brown'
}

export type Picure = {
  pictureUrl: string;
  description: string;
};

export type SizeColorQuantity = {
  _id: ObjectId;
  size: Size;
  color: Color;
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
  available: Array<SizeColorQuantity>;
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
