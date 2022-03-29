import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
let isConnected: boolean | number;

const connectToDatabase = (): Promise<any> => {
  if (isConnected) {
    console.log('=> Using existing database connection.');
    return Promise.resolve();
  }

  console.log('=> Using new database connection.');
  return mongoose.connect(process.env.MONGO_URL as string).then((db) => {
    isConnected = db.connections[0].readyState;
  });
};

export default connectToDatabase;
