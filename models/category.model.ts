import { Schema, model, models } from 'mongoose';
import { CategoryModel, CategoryDocument } from 'types/category.type';

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

categorySchema.pre('save', function (next): void {
  if (this.isModified('name')) {
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }

  next();
});

const Category =
  (models.Category as CategoryModel) || model<CategoryDocument, CategoryModel>('Category', categorySchema);

export default Category;
