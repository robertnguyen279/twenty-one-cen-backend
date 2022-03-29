import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      unique: true
    },
    password: {
      type: String,
      trim: true
    },
    avatarUrl: {
      type: String
    },
    role: {
      type: String,
      enum: ['user', 'superviser', 'admin']
    }
  },
  {
    timestamps: true
  }
);

const User = model('User', userSchema);

export default User;
