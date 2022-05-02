import { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UserContactDetail } from './user.type';
import { ItemDocument } from 'types/item.type';
import { VoucherDocument } from 'types/voucher.type';

export interface ContactDetail extends UserContactDetail {
  name: string;
}

export enum OrderStatus {
  placed = 'placed',
  approved = 'approved',
  done = 'done',
  cancelled = 'cancelled'
}

export type OrderProduct = {
  productId: ObjectId;
  item: ObjectId;
  quantity: number;
};

export interface Order {
  products: Array<OrderProduct>;
  contactDetail: ContactDetail;
  vouchers?: Array<string>;
  orderDate: Date;
  shipDate?: Date;
  originalPrice?: number;
  totalPrice: number;
  description?: string;
  user?: ObjectId;
  status: OrderStatus;
}

export interface OrderDocument extends Order, Document {
  _doc: OrderDocument;
}

export interface OrderModel extends Model<OrderDocument> {
  calculateProductPrice(item: ItemDocument, vouchers: Array<VoucherDocument>): number;
}
