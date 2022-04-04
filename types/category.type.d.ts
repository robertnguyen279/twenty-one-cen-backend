import { Document, Model } from 'mongoose';

export interface Category {
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CategoryDocument = Category & Document;

export type CategoryModel = Model<CategoryDocument>;
