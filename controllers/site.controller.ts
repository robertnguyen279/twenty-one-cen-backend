import { Request, Response, NextFunction } from 'express';
import SiteInfo from 'models/site.model';
import { filterRequestBody } from 'services/common.service';
import { UnprocesableError } from 'services/error.service';

const validSiteInfoKeys = ['phone', 'email', 'zalo', 'facebook'];

export const createSiteInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    filterRequestBody(validSiteInfoKeys, req.body);

    const siteInfo = new SiteInfo(req.body);

    const siteInfoDoc = await SiteInfo.find();

    if (siteInfoDoc.length) {
      throw new UnprocesableError();
    }

    await siteInfo.save();

    res.status(201).send({ statusCode: 201, message: 'Create site info successfully' });
  } catch (error) {
    next(error);
  }
};

export const getSiteInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const siteInfo = await SiteInfo.find();

    res.send({ statusCode: 200, message: 'Get site info successfully', siteInfo: siteInfo[0] });
  } catch (error) {
    next(error);
  }
};

export const updateSiteInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    filterRequestBody(validSiteInfoKeys, req.body);
    const siteInfo = await SiteInfo.find();

    for (const key in req.body) {
      siteInfo[0][key] = req.body[key];
    }

    await siteInfo[0].save();

    res.send({ statusCode: 200, message: 'Site info updated successfully' });
  } catch (error) {
    next(error);
  }
};
