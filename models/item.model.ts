import { Schema, model, models, Types } from 'mongoose';
import { ItemModel, ItemDocument } from 'types/item.type';

const itemSchema = new Schema(
  {
    size: {
      type: String,
      required: true,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    color: {
      type: String
    },
    quantity: {
      type: Number,
      required: true
    },
    product: {
      type: Types.ObjectId,
      required: true,
      ref: 'Product'
    }
  },
  { timestamps: true }
);

const Item = (models.Item as ItemModel) || model<ItemDocument, ItemModel>('Item', itemSchema);

export default Item;
