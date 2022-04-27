import { Document, Model } from 'mongoose';

export interface Carousel {
  picture: string;
  description: string;
}

export type CarouselDocument = Carousel & Document;

export type CarouselModel = Model<CarouselDocument>;
