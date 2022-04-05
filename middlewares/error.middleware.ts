import { Request, Response, NextFunction } from 'express';
import { ErrorType } from 'types/error.type';

export const errorLogger = (error: ErrorType, req: Request, res: Response, next: NextFunction) => {
  console.error('\x1b[31m', error); // adding some color to our logs
  req.error = error;
  next(); // calling next middleware
};

export const errorResponder = (req: Request, res: Response) => {
  res.header('Content-Type', 'application/json');
  const error = req.error;

  if (error && error.statusCode) {
    res.status(error.statusCode).send(error);
  } else if (error) {
    res.status(400).send({ name: error.name, message: error.message, statusCode: 400 });
  }
};
