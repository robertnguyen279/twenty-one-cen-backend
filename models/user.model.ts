import { Schema, model, models } from 'mongoose';
import { UserDocument, UserModel } from 'types/user.type';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true,
      validate: {
        validator: (firstName: string) => {
          return /^(?=.{1,50}$)[a-z]+(?:['_.\s][a-z]+)*$/gim.test(firstName);
        },
        message: 'First name is invalid'
      }
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
      validate: {
        validator: (lastName: string) => {
          return validator.isAlpha(lastName);
        },
        message: 'Last name is invalid'
      }
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      validate: {
        validator: (email: string) => {
          return validator.isEmail(email);
        },
        message: 'Email is invalid'
      }
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 20,
      validate: {
        validator: (password: string) => {
          return (
            !/\s/.test(password) &&
            validator.isStrongPassword(password, {
              minLength: 6,
              minUppercase: 0,
              minSymbols: 0
            })
          );
        },
        message: 'Invalid password.'
      }
    },
    avatarUrl: {
      type: String
    },
    role: {
      type: String,
      enum: ['user', 'superviser', 'admin'],
      required: true,
      default: 'user'
    },
    phone: {
      type: Number
    },
    contactDetails: [
      {
        province: {
          type: String,
          required: true,
          trim: true
        },
        district: {
          type: String,
          required: true,
          trim: true
        },
        addressDetail: {
          type: String,
          required: true,
          trim: true
        }
      }
    ],
    birthday: {
      type: Date
    },
    refreshToken: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function (next): Promise<void> {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

userSchema.methods.generateAccessToken = async function (): Promise<string> {
  const accessToken = await jwt.sign({ userId: this._id }, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: process.env.JWT_ACCESS_TIME
  });

  return accessToken;
};

userSchema.methods.generateRefreshToken = async function (): Promise<string> {
  const refreshToken = await jwt.sign({ userId: this._id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_TIME
  });

  this.refreshToken = refreshToken;
  return refreshToken;
};

userSchema.methods.comparePassword = function (password: string): boolean {
  return bcrypt.compareSync(password, this.password);
};

userSchema.statics.verifyAccessToken = async function (token: string): Promise<UserDocument> {
  const { userId } = await (<jwt.UserIDJwtPayload>jwt.verify(token, process.env.JWT_ACCESS_SECRET as string));

  const user = await User.findById(userId).select('-refreshToken -password');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

userSchema.statics.generateHashPassword = async function (password: string): Promise<string> {
  return bcrypt.hash(password, 8);
};

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const User = (models.User as UserModel) || model<UserDocument, UserModel>('User', userSchema);

export default User;
