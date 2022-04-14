import { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface Voucher {
  code: string;
  description: string;
  discount: number;
  category?: ObjectId;
  expiresIn: Date;
  public: boolean;
}

export interface VoucherDocument extends Voucher, Document {
  _doc: VoucherDocument;
}

export type VoucherModel = Model<VoucherDocument>;
