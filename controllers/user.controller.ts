import { Request, Response } from 'express';
import User from 'models/user.model';
import { filterRequestBody } from 'services/common.service';

const validSignupKeys = ['firstName', 'lastName', 'email', 'password', 'phone', 'avatarUrl', 'birthday'];

export const createUser = async (req: Request, res: Response) => {
  try {
    filterRequestBody(validSignupKeys, req.body);
    const user = new User(req.body);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    await user.save();

    res.send({ message: 'User created successfully', accessToken, refreshToken });
  } catch (error) {
    if (error.message.includes('Invalid request body key')) {
      res.status(422);
    } else {
      res.status(400);
    }

    res.send({ message: error.message });
  }
};
