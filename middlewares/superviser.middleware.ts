import { Request, Response, NextFunction } from 'express';
import { UserDocument } from 'types/user.type';

const checkSuperviser = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.authUser as UserDocument;

  if (user.role !== 'admin' && user.role !== 'superviser') {
    return res.status(403).send({ message: 'You are not authorized' });
  }

  next();
};

export default checkSuperviser;
