import { Request, Response } from 'express';
import User from 'models/user.model';
import { filterRequestBody } from 'services/common.service';
import { UserDocument } from 'types/user.type';
import { Types } from 'mongoose';
import validator from 'validator';

const signupKeys = ['firstName', 'lastName', 'email', 'password', 'phone', 'avatarUrl', 'birthday'];
const signupByAdminKeys = ['firstName', 'lastName', 'email', 'password', 'phone', 'avatarUrl', 'birthday', 'role'];
const loginKeys = ['emailOrPhone', 'password'];
const addressKeys = ['province', 'district', 'addressDetail', 'phone'];

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
    const { emailOrPhone, password } = filterRequestBody(loginKeys, req.body);
    let user;

    if (validator.isEmail(emailOrPhone)) {
      user = await User.findOne({ email: emailOrPhone }).select('-refreshToken');
    } else if (validator.isMobilePhone(emailOrPhone.toString(), ['vi-VN'])) {
      user = await User.findOne({ phone: emailOrPhone }).select('-refreshToken');
    }

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

    if (req.body.phone && !validator.isMobilePhone(req.body.phone.toString(), ['vi-VN'])) {
      throw new Error('Phone is not valid');
    }

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

export const deleteUserByAdmin = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const doc = await User.findByIdAndDelete(id);
    if (!doc) {
      throw new Error('No user found');
    }

    return res.send({ message: 'Delete user successfully' });
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

export const getUsers = async (req: Request, res: Response) => {
  try {
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const sortBy = req.query.sortBy ? req.query.sortBy : 'createdAt';
    const order = req.query.order ? req.query.order : 'desc';

    const users = await User.find()
      .skip(skip)
      .limit(limit)
      .sort([[sortBy, order]])
      .select('-refreshToken -password');

    return res.send(users);
  } catch (error) {
    console.error(error);

    res.status(400).send({ message: error.message });
  }
};

export const addContact = async (req: Request, res: Response) => {
  try {
    const user = req.authUser as UserDocument;
    filterRequestBody(addressKeys, req.body);

    const _id = new Types.ObjectId();
    const contactDetail = {
      _id,
      ...req.body
    };

    user.contactDetails?.push(contactDetail);
    await user.save();

    res.send({ message: 'Add contact successfully' });
  } catch (error) {
    console.error(error);

    return res.status(400).send({ message: error.message });
  }
};

export const updateContact = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const user = req.authUser as UserDocument;
    filterRequestBody(addressKeys, req.body);

    const updateArgs = {};

    for (const key in req.body) {
      updateArgs[`contactDetails.$.${key}`] = req.body[key];
    }

    if (req.body.phone && !validator.isMobilePhone(req.body.phone.toString(), ['vi-VN'])) {
      throw new Error('Phone is not valid');
    }

    const doc = await User.findOneAndUpdate({ _id: user._id, 'contactDetails._id': id }, updateArgs, { new: true });

    if (!doc) {
      throw new Error('Update contact failed');
    }

    return res.send({ message: 'Contact updated' });
  } catch (error) {
    console.error(error);

    return res.status(400).send({ message: error.message });
  }
};
