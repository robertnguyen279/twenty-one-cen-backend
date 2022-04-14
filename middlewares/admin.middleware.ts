import { Request, Response, NextFunction } from 'express';
import { UserDocument } from 'types/user.type';
import { ForbiddenError } from 'services/error.service';

const checkAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.authUser as UserDocument;

  if (user.role !== 'admin') {
    throw new ForbiddenError();
  }

  next();
};

export default checkAdmin;
