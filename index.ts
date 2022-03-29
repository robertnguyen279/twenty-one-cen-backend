import serverless from 'serverless-http';
import express from 'express';
import morgan from 'morgan';
import userRoutes from 'routes/user.route';
import connectToDatabase from 'services/mongoose.service';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use('/users', userRoutes);

export const handler = serverless(app, {
  async request(request, event, context) {
    context.callbackWaitsForEmptyEventLoop = false;
    await connectToDatabase();
  }
});
