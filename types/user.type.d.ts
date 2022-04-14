import { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';

export enum Role {
  user = 'user',
  superviser = 'superviser',
  admin = 'admin'
}

export type UserContactDetail = {
  _id: ObjectId;
  province: string;
  district: string;
  addressDetail: string;
  phone: number;
  firstName: string;
  lastName: string;
};

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  role: Role;
  phone: number;
  birthday?: Date;
  refreshToken: string;
  contactDetails?: Array<UserContactDetail>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserDocument extends User, Document {
  generateAccessToken(): Promise<string>;
  generateRefreshToken(): Promise<string>;
  fullName: string;
  comparePassword(password: string): string;
  _doc: UserDocument;
}

export interface UserModel extends Model<UserDocument> {
  verifyAccessToken(token): Promise<UserDocument>;
  verifyRefreshToken(token): Promise<UserDocument>;
  generateHashPassword(password: string): Promise<string>;
}
