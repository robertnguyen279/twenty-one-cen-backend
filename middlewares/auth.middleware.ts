import { Request, Response, NextFunction } from 'express';
import User from 'models/user.model';

const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  const bearerHeader = req.headers['authorization'];

  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    try {
      const user = await User.verifyAccessToken(bearerToken);

      req.authUser = user;

      next();
    } catch (error) {
      console.error(error);

      if (error.message.includes('User not found')) {
        res.status(404);
      } else {
        res.status(400);
      }

      res.send({ error: error.message });
    }
  } else {
    res.status(401).send({
      message: 'You are unauthorized'
    });
  }
};

export default checkAuth;
