import { Document, Model } from 'mongoose';

export interface SiteInfo {
  phone: number;
  zalo: number;
  facebook: string;
  email: string;
}

export type SiteInfoDocument = Document & SiteInfo;

export type SiteInfoModel = Model<SiteInfoDocument>;
