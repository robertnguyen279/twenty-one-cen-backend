import { Schema, model, models } from 'mongoose';
import validator from 'validator';
import { CarouselDocument, CarouselModel } from 'types/carousel.type';

const carouselSchema = new Schema(
  {
    picture: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (url: string) => {
          return validator.isURL(url);
        },
        message: 'Invalid url.'
      }
    },
    url: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Carousel =
  (models.Carousel as CarouselModel) || model<CarouselDocument, CarouselModel>('Carousel', carouselSchema);

export default Carousel;
