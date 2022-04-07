import serverless from 'serverless-http';
import express from 'express';
import morgan from 'morgan';
import connectToDatabase from 'services/mongoose.service';
import userRoutes from 'routes/user.route';
import productRoutes from 'routes/product.route';
import voucherRoutes from 'routes/voucher.route';
import orderRoutes from 'routes/order.route';
import postRoutes from 'routes/post.route';
import siteInfoRoutes from 'routes/site.route';
import { errorLogger, errorResponder } from 'middlewares/error.middleware';
const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use('/user', userRoutes);
app.use('/product', productRoutes);
app.use('/voucher', voucherRoutes);
app.use('/order', orderRoutes);
app.use('/post', postRoutes);
app.use('/site', siteInfoRoutes);

app.use(errorLogger);
app.use(errorResponder);

export const handler = serverless(app, {
  async request(request, event, context) {
    context.callbackWaitsForEmptyEventLoop = false;
    await connectToDatabase();
  }
});
