import { Request, Response, NextFunction } from 'express';
import { UserDocument } from 'types/user.type';

const checkAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.authUser as UserDocument;

  if (user.role !== 'admin') {
    return res.status(403).send({ message: 'You are not authorized' });
  }

  next();
};

export default checkAdmin;
