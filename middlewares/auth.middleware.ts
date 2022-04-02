import { Request, Response, NextFunction } from 'express';
import User from 'models/user.model';
import { ForbiddenError } from 'services/error.service';

const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bearerHeader = req.headers['authorization'];

    if (bearerHeader) {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      const user = await User.verifyAccessToken(bearerToken);

      req.authUser = user;

      next();
    } else {
      throw new ForbiddenError();
    }
  } catch (error) {
    next(error);
  }
};

export default checkAuth;
