import { Request, Response, NextFunction } from 'express';
import Voucher from 'models/voucher.model';
import { filterRequestBody } from 'services/common.service';
import { NotFoundError } from 'services/error.service';

const validVoucherKeys = ['description', 'category', 'expiresIn', 'discount', 'public', 'code'];

export const createVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    filterRequestBody(validVoucherKeys, req.body);

    const voucher = new Voucher(req.body);

    await voucher.save();

    res.status(201).send({ statusCode: 201, message: 'Create voucher successfully', voucher });
  } catch (error) {
    next(error);
  }
};

export const getVoucherById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const voucher = await Voucher.findById(id).populate({ path: 'category', select: 'name' });

    if (!voucher) {
      throw new NotFoundError('Voucher');
    }

    res.send({ statusCode: 200, message: 'Get voucher successfully', voucher });
  } catch (error) {
    next(error);
  }
};

export const getAllVouchers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vouchers = await Voucher.find()
      .populate({ path: 'category', select: 'name' })
      .sort([['createdAt', 'desc']]);

    res.send({ statusCode: 200, message: 'Get all voucher successfully', vouchers });
  } catch (error) {
    next(error);
  }
};

export const updateVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    filterRequestBody(validVoucherKeys, req.body);
    const id = req.params.id;
    await Voucher.findByIdAndUpdate(id, req.body);

    res.send({ statusCode: 200, message: 'Update voucher successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const doc = await Voucher.findByIdAndDelete(id);

    if (!doc) {
      throw new NotFoundError('Voucher');
    }
    res.send({ statusCode: 200, message: 'Voucher deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getPublicVouchers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vouchers = await Voucher.find({ public: true }).populate({ path: 'category', select: 'name' });

    res.send({ statusCode: 200, message: 'Get public voucher successfully', vouchers });
  } catch (error) {
    next(error);
  }
};
