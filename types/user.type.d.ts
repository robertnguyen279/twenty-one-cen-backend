import { Document, Model } from 'mongoose';

export enum Role {
  user = 'user',
  superviser = 'superviser',
  admin = 'admin'
}

export type ContactDetails = {
  province: string;
  district: string;
  addressDetail: string;
};

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatarUrl?: string;
  role: Role;
  phone?: number;
  birthday?: Date;
  contactDetails?: Array<ContactDetails>;
}

export interface UserDocument extends User, Document {
  generateAccessToken(): Promise<string>;
  generateRefreshToken(): Promise<string>;
}

export type UserModel = Model<UserDocument>;
