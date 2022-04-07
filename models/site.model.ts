import { Schema, model, models } from 'mongoose';
import validator from 'validator';
import { SiteInfoDocument, SiteInfoModel } from 'types/site.type';

const siteSchema = new Schema(
  {
    phone: {
      type: Number,
      required: true,
      validate: {
        validator: (phone: number) => {
          return validator.isMobilePhone(phone.toString(), ['vi-VN']);
        },
        message: 'Phone is invalid'
      }
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: (email: string) => {
          return validator.isEmail(email);
        },
        message: 'Email is invalid'
      }
    },
    zalo: {
      type: Number,
      required: true,
      validate: {
        validator: (phone: number) => {
          return validator.isMobilePhone(phone.toString(), ['vi-VN']);
        },
        message: 'Phone is invalid'
      }
    },
    facebook: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const SiteInfo = (models.SiteInfo as SiteInfoModel) || model<SiteInfoDocument, SiteInfoModel>('SiteInfo', siteSchema);

export default SiteInfo;
