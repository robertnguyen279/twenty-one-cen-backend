import { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UserContactDetail } from './user.type';

export interface ContactDetail extends UserContactDetail {
  name: string;
}

export enum OrderStatus {
  placed = 'placed',
  approved = 'approved',
  done = 'done'
}

export interface Order {
  products: Array<ObjectId>;
  contactDetail: ContactDetail;
  vouchers?: Array<ObjectId>;
  orderDate: Date;
  shipDate?: Date;
  totalPrice: number;
  description?: string;
  user?: ObjectId;
  status: OrderStatus;
}

export interface OrderDocument extends Order, Document {
  _doc: OrderDocument;
}

export type OrderModel = Model<OrderDocument>;
