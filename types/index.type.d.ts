import * as jwt from 'jsonwebtoken';
import { UserDocument } from 'types/user.type';
import { ErrorType } from 'types/error.type';

declare module 'express' {
  export interface Request {
    authUser?: UserDocument;
    error: ErrorType;
  }
}

declare module 'jsonwebtoken' {
  export interface UserIDJwtPayload extends jwt.JwtPayload {
    userId: string;
  }
}
