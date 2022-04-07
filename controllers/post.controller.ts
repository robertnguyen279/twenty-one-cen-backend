import { Request, Response, NextFunction } from 'express';
import Post from 'models/post.model';
import { filterRequestBody } from 'services/common.service';
import { NotFoundError } from 'services/error.service';

const validPostKeys = ['title', 'picture', 'content'];

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    filterRequestBody(validPostKeys, req.body);

    const post = new Post({ ...req.body, postBy: req.authUser?._id });

    await post.save();

    res.send({ statusCode: 200, message: 'Create post successfully' });
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
    const sortBy = req.query.sortBy ? req.query.sortBy : 'createdAt';
    const order = req.query.order ? req.query.order : 'desc';

    const posts = await Post.find()
      .populate({ path: 'postBy', select: 'firstName lastName avatarUrl' })
      .skip(skip)
      .limit(limit)
      .sort([[sortBy, order]]);

    res.send({ statusCode: 200, message: 'Get posts successfully', posts });
  } catch (error) {
    next(error);
  }
};

export const getPostByUrlString = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const urlString = req.params.urlString;
    const post = await Post.findOne({ urlString }).populate({ path: 'postBy', select: 'firstName lastName avatarUrl' });
    if (!post) {
      throw new NotFoundError('Post');
    }
    res.send({ statusCode: 200, message: 'Get post successfully', post });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    filterRequestBody(validPostKeys, req.body);

    const post = await Post.findById(id);
    if (!post) {
      throw new NotFoundError('Post');
    }

    for (const key in req.body) {
      post[key] = req.body[key];
    }

    await post.save();

    res.send({ statusCode: 200, message: 'Update post successfully' });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    const doc = await Post.findByIdAndDelete(id);

    if (!doc) {
      throw new NotFoundError('Post');
    }

    res.send({ status: 200, message: 'Delete post successfully' });
  } catch (error) {
    next(error);
  }
};
