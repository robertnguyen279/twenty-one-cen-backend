import { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
export enum Size {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL'
}

export interface Item {
  size: Size;
  color: string;
  quantity: number;
  productId: ObjectId;
}

export interface ItemDocument extends Item, Document {
  _doc: ItemDocument;
}

export type ItemModel = Model<ItemDocument>;
