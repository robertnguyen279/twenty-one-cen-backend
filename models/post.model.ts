import { Schema, model, models, Types } from 'mongoose';
import { PostDocument, PostModel } from 'types/post.type';
import { removeVietnameseTones, transformNameToUrl } from 'services/common.service';

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    urlString: {
      type: String,
      required: true,
      trim: true
    },
    postBy: {
      type: Types.ObjectId,
      ref: 'User'
    },
    picture: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

postSchema.pre('validate', function (next): void {
  const noToneTitle = removeVietnameseTones(this.title);
  this.urlString = transformNameToUrl(noToneTitle);

  next();
});

const Post = (models.Post as PostModel) || model<PostDocument, PostModel>('Post', postSchema);

export default Post;
