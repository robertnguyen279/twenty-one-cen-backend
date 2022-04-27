import { Request, Response, NextFunction } from 'express';
import { filterRequestBody } from 'services/common.service';
import { UnprocesableError, NotFoundError } from 'services/error.service';
import Carousel from 'models/carousel.model';

const validCarouselKeys = ['picture', 'description'];

export const createCarousel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    filterRequestBody(validCarouselKeys, req.body);

    const carousels = await Carousel.find();

    if (carousels.length >= 8) {
      throw new UnprocesableError();
    }

    const carousel = new Carousel(req.body);

    await carousel.save();

    res.status(201).send({ statusCode: 201, message: 'Create carousel item successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllCarousels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const carousels = await Carousel.find().sort([['createdAt', 'desc']]);

    res.send({ statusCode: 200, message: 'Get carousels successfully', carousels });
  } catch (error) {
    next(error);
  }
};

export const getCarouselById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const carousel = await Carousel.findById(id);

    if (!carousel) {
      throw new NotFoundError('Carousel');
    }

    res.send({ statusCode: 200, message: 'Get carousel successfully', carousel });
  } catch (error) {
    next(error);
  }
};

export const updateCarousel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const carousel = await Carousel.findById(id);

    if (!carousel) {
      throw new NotFoundError('Carousel');
    }

    for (const key in req.body) {
      carousel[key] = req.body[key];
    }

    await carousel.save();

    res.send({ statusCode: 200, message: 'Update carousel successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteCarousel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const doc = await Carousel.findByIdAndDelete(id);

    if (!doc) {
      throw new NotFoundError('Carousel');
    }

    res.send({ statusCode: 200, message: 'Delete carousel successfully' });
  } catch (error) {
    next(error);
  }
};
