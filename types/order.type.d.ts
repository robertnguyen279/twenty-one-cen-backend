import { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UserContactDetail } from './user.type';
import { ProductDocument } from 'types/product.type';
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
  totalPrice: number;
  description?: string;
  user?: ObjectId;
  status: OrderStatus;
}

export interface OrderDocument extends Order, Document {
  _doc: OrderDocument;
}

export interface OrderModel extends Model<OrderDocument> {
  calculateProductPrice(product: ProductDocument, vouchers: Array<VoucherDocument>): number;
}
