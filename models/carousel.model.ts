import { Schema, model, models } from 'mongoose';
import { CarouselDocument, CarouselModel } from 'types/carousel.type';

const carouselSchema = new Schema(
  {
    picture: {
      type: String,
      required: true,
      unique: true
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
