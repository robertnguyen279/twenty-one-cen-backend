import { Schema, model, models, Types } from 'mongoose';
import { VoucherDocument, VoucherModel } from 'types/voucher.type';

const voucherSchema = new Schema(
  {
    code: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    public: {
      type: Boolean,
      default: false
    },
    discount: {
      type: Number,
      min: 0,
      max: 100
    },
    category: {
      type: Types.ObjectId,
      ref: 'Category'
    },
    expiresIn: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

const Voucher = (models.Voucher as VoucherModel) || model<VoucherDocument, VoucherModel>('Voucher', voucherSchema);

export default Voucher;
