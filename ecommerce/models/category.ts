import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema: Schema<ICategory> = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

const Category: Model<ICategory> = mongoose.model<ICategory>(
  'Category',
  CategorySchema
);

export default Category;
