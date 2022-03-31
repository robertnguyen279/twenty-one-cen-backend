import { Request, Response } from 'express';
import User from 'models/user.model';
import { filterRequestBody } from 'services/common.service';
import { UserDocument } from 'types/user.type';

const signupKeys = ['firstName', 'lastName', 'email', 'password', 'phone', 'avatarUrl', 'birthday'];
const signupByAdminKeys = ['firstName', 'lastName', 'email', 'password', 'phone', 'avatarUrl', 'birthday', 'role'];
const loginKeys = ['email', 'password'];

export const createUser = async (req: Request, res: Response) => {
  try {
    filterRequestBody(signupKeys, req.body);
    const user = new User(req.body);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    await user.save();

    return res
      .status(201)
      .send({ ...user._doc, accessToken, refreshToken, password: undefined, fullName: user.fullName });
  } catch (error) {
    console.error(error);

    if (error.message.includes('Invalid request body key')) {
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

    await user.save();

    return res.send({ ...user._doc, password: undefined, accessToken, refreshToken });
  } catch (error) {
    console.error(error);

    if (error.message.includes('Invalid request body key')) {
      res.status(422);
    } else if (error.message.includes('Incorrect password')) {
      res.status(403);
    } else {
      res.status(400);
    }

    return res.send({ message: error.message });
  }
};

export const getUser = (req: Request, res: Response) => {
  const user = req.authUser as UserDocument;

  return res.send({ ...user._doc, fullName: user.fullName });
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = req.authUser as UserDocument;
    filterRequestBody(signupKeys, req.body);
    for (const key in req.body) {
      user[key] = req.body[key];
    }
    await user.save();

    return res.send({ message: 'Update user successfully' });
  } catch (error) {
    console.error(error);

    if (error.message.includes('Invalid request body key')) {
      console.error(error);

      res.status(422);
    } else {
      res.status(400);
    }

    return res.send({ message: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id).select('-refreshToken -password');

    if (!user) {
      throw new Error('No user found');
    }

    return res.send({ ...user._doc, fullName: user.fullName });
  } catch (error) {
    console.error(error);

    if (error.message.includes('No user found')) {
      res.status(404);
    } else {
      res.status(400);
    }

    return res.send({ message: error.message });
  }
};

export const createUserByAdmin = async (req: Request, res: Response) => {
  try {
    filterRequestBody(signupByAdminKeys, req.body);
    const user = new User(req.body);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    await user.save();

    return res.status(201).send({ ...user._doc, accessToken, refreshToken, password: undefined });
  } catch (error) {
    console.error(error);

    if (error.message.includes('Invalid request body key')) {
      res.status(422);
    } else {
      res.status(400);
    }

    return res.send({ message: error.message });
  }
};

export const updateUserByAdmin = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    filterRequestBody(signupByAdminKeys, req.body);

    if (req.body.password) {
      req.body.password = await User.generateHashPassword(req.body.password);
    }

    await User.findOneAndUpdate({ _id: id }, req.body);

    return res.send({ message: 'Update user successfully' });
  } catch (error) {
    console.error(error);

    if (error.message.includes('Invalid request body key')) {
      console.error(error);

      res.status(422);
    } else {
      res.status(400);
    }

    return res.send({ message: error.message });
  }
};
