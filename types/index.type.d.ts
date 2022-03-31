import * as jwt from 'jsonwebtoken';
import { UserDocument } from 'types/user.type';

declare module 'express' {
  export interface Request {
    authUser?: UserDocument;
  }
}

declare module 'jsonwebtoken' {
  export interface UserIDJwtPayload extends jwt.JwtPayload {
    userId: string;
  }
}
