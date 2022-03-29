import { Request, Response } from 'express';
import User from 'models/user.model';

export const createUser = async (req: Request, res: Response) => {
  const user = new User(req.body);

  await user.save();

  return res.send(user);
};

export const getUsers = async (req: Request, res: Response) => {
  const users = await User.find();

  res.send(users);
};
