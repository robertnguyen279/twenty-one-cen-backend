import { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface Post {
  title: string;
  urlString: string;
  postBy: ObjectId;
  picture: string;
  content: string;
}

export type PostDocument = Post & Document;

export type PostModel = Model<PostDocument>;
