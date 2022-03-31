import { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';

export enum Role {
  user = 'user',
  superviser = 'superviser',
  admin = 'admin'
}

export type ContactDetail = {
  _id: ObjectId;
  province: string;
  district: string;
  addressDetail: string;
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
  contactDetails?: Array<ContactDetail>;
}

export interface UserDocument extends User, Document {
  generateAccessToken(): Promise<string>;
  generateRefreshToken(): Promise<string>;
  fullName: string;
  comparePassword(password: string): string;
  _doc: User;
}

export interface UserModel extends Model<UserDocument> {
  verifyAccessToken(token): Promise<UserDocument>;
  generateHashPassword(password: string): Promise<string>;
}