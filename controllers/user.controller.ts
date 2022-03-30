import { Request, Response } from 'express';
import User from 'models/user.model';
import { filterRequestBody } from 'services/common.service';

const signupKeys = ['firstName', 'lastName', 'email', 'password', 'phone', 'avatarUrl', 'birthday'];
const loginKeys = ['email', 'password'];

export const createUser = async (req: Request, res: Response) => {
  try {
    filterRequestBody(signupKeys, req.body);
    const user = new User(req.body);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    await user.save();

    return res.status(201).send({ ...user._doc, accessToken, refreshToken, password: undefined });
  } catch (error) {
    if (error.message.includes('Invalid request body key')) {
      console.error(error);

      res.status(422);
    } else {
      res.status(400);
    }

    return res.send({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = filterRequestBody(loginKeys, req.body);

    const user = await User.findOne({ email }).select('-refreshToken');

    if (!user) {
      throw new Error('No user found');
    }

    if (!user.comparePassword(password)) {
      throw new Error('Incorrect password');
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.password = password;

    await user.save();

    return res.send({ ...user._doc, password: undefined, accessToken, refreshToken });
  } catch (error) {
    console.error(error);

    if (error.message.includes('Invalid request body key') || error.message.includes('Incorrect password')) {
      res.status(422);
    } else {
      res.status(400);
    }

    return res.send({ message: error.message });
  }
};

export const getUser = (req: Request, res: Response) => {
  const user = req.authUser;

  return res.send(user);
};
