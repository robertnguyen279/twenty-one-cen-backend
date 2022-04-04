import { Request, Response, NextFunction } from 'express';
import User from 'models/user.model';
import { filterRequestBody } from 'services/common.service';
import { UserDocument } from 'types/user.type';
import { Types } from 'mongoose';
import validator from 'validator';
import { NotFoundError, ForbiddenError, InvalidBodyError, InvalidQueryError } from 'services/error.service';
import axios from 'axios';

const signupKeys = ['firstName', 'lastName', 'email', 'password*', 'phone', 'avatarUrl', 'birthday'];
const signupByThirdPartyKeys = ['firstName', 'lastName', 'email', 'avatarUrl', 'thirdPartyToken'];
const signupByAdminKeys = ['firstName', 'lastName', 'email', 'password', 'phone', 'avatarUrl', 'birthday', 'role'];
const loginKeys = ['emailOrPhone', 'password'];
const addressKeys = ['province', 'district', 'addressDetail', 'phone'];

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    filterRequestBody(signupKeys, req.body);

    const user = new User(req.body);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    await user.save();

    return res.status(201).send({
      statusCode: 201,
      message: 'Create user successfully',
      accessToken,
      refreshToken,
      user: { ...user._doc, password: undefined, fullName: user.fullName }
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { emailOrPhone, password } = filterRequestBody(loginKeys, req.body);
    let user;

    if (validator.isEmail(emailOrPhone)) {
      user = await User.findOne({ email: emailOrPhone }).select('-refreshToken');
    } else if (validator.isMobilePhone(emailOrPhone.toString(), ['vi-VN'])) {
      user = await User.findOne({ phone: emailOrPhone }).select('-refreshToken');
    }

    if (!user) {
      throw new NotFoundError('User');
    }

    if (!user.comparePassword(password)) {
      throw new ForbiddenError();
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    await user.save();

    return res.send({
      statusCode: 200,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: { ...user._doc, password: undefined, fullName: user.fullName }
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = (req: Request, res: Response) => {
  const user = req.authUser as UserDocument;

  return res.send({
    message: 'Get user successfully',
    statusCode: 200,
    user: { ...user._doc, fullName: user.fullName }
  });
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.authUser as UserDocument;
    filterRequestBody(signupKeys, req.body);

    for (const key in req.body) {
      user[key] = req.body[key];
    }
    await user.save();

    return res.send({ message: 'Update user successfully', statusCode: 200 });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id).select('-refreshToken -password');

    if (!user) {
      throw new NotFoundError('User');
    }

    return res.send({
      message: 'Get user successfully',
      statusCode: 200,
      user: { ...user._doc, fullName: user.fullName }
    });
  } catch (error) {
    next(error);
  }
};

export const createUserByAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    filterRequestBody(signupByAdminKeys, req.body);
    const user = new User(req.body);
    await user.save();

    return res.status(201).send({
      statusCode: 200,
      message: 'Create user successfully',
      user: { ...user._doc, password: undefined }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserBySuperviser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    filterRequestBody(signupByAdminKeys, req.body);

    if (req.body.password) {
      req.body.password = await User.generateHashPassword(req.body.password);
    }

    const doc = await User.findOneAndUpdate({ _id: id, role: 'user' }, req.body);

    if (!doc) {
      throw new NotFoundError('User');
    }

    return res.send({ message: 'Update user successfully', statusCode: 200 });
  } catch (error) {
    next(error);
  }
};

export const updateUserByAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    filterRequestBody(signupByAdminKeys, req.body);

    if (req.body.password) {
      req.body.password = await User.generateHashPassword(req.body.password);
    }

    await User.findOneAndUpdate({ _id: id, role: { $in: ['user', 'superviser'] } }, req.body);

    return res.send({ message: 'Update user successfully', statusCode: 200 });
  } catch (error) {
    next(error);
  }
};

export const deleteUserBySuperviser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const doc = await User.findOneAndDelete({ _id: id, role: 'user' });
    if (!doc) {
      throw new NotFoundError('User');
    }

    return res.send({ message: 'Delete user successfully', statusCode: 200 });
  } catch (error) {
    next(error);
  }
};

export const deleteUserByAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const doc = await User.findOneAndDelete({ _id: id, role: { $in: ['user', 'superviser'] } });
    if (!doc) {
      throw new NotFoundError('User');
    }

    return res.send({ message: 'Delete user successfully', statusCode: 200 });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
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

    return res.send({ message: 'Get users successfully', statusCode: 200, users });
  } catch (error) {
    next(error);
  }
};

export const addContact = async (req: Request, res: Response, next: NextFunction) => {
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

    return res.status(201).send({ message: 'Add contact successfully', statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const user = req.authUser as UserDocument;
    filterRequestBody(addressKeys, req.body);

    const updateArgs = {};

    for (const key in req.body) {
      updateArgs[`contactDetails.$.${key}`] = req.body[key];
    }

    if (req.body.phone && !validator.isMobilePhone(req.body.phone.toString(), ['vi-VN'])) {
      throw new InvalidBodyError('phone');
    }

    const doc = await User.findOneAndUpdate({ _id: user._id, 'contactDetails._id': id }, updateArgs, { new: true });

    if (!doc) {
      throw new Error('Update contact failed');
    }

    return res.send({ message: 'Contact updated', statusCode: 200 });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const user = req.authUser as UserDocument;

    await User.findOneAndUpdate({ _id: user._id }, { $pull: { contactDetails: { _id: id } } });

    return res.send({ message: 'Contact deleted', statusCode: 200 });
  } catch (error) {
    next(error);
  }
};

export const getAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = filterRequestBody(['token'], req.body);

    const user = await User.verifyRefreshToken(token);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    await user.save();

    return res.send({
      message: 'Get new access token successfully',
      statusCode: 200,
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.authUser as UserDocument;

    await User.updateOne({ _id: user._id }, { $unset: { refreshToken: 1 } });
    return res.send({ message: 'Logout successfully', statusCode: 200 });
  } catch (error) {
    next(error);
  }
};

export const getGoogleUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.authUser as UserDocument;
    console.log(req.user);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    await user.save();

    res.send({ statusCode: 200, message: 'Get Google user successfully', user, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

export const loginByThirdParty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = req.query.type;
    const { firstName, lastName, email, avatarUrl, thirdPartyToken } = filterRequestBody(
      signupByThirdPartyKeys,
      req.body
    );

    if (type === 'google') {
      await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${thirdPartyToken}`);
    } else if (type === 'facebook') {
      await axios.get(`https://graph.facebook.com/me?access_token=${thirdPartyToken}`);
    } else {
      throw new InvalidQueryError('type');
    }

    let user: UserDocument | null;

    user = await User.findOne({ email });

    if (!user) {
      user = new User({ firstName, lastName, email, avatarUrl });
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    await user.save();

    res.send({ statusCode: 200, message: `Login by ${type} successfully`, user, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};
