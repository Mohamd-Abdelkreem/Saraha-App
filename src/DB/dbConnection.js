import mongoose from 'mongoose';

const dbConnection = async () => {
  try {
    await mongoose
      .connect(process.env.DB_URL_LOCAL, {
        serverSelectionTimeoutMS: 5000,
      })
      .then(() => {
        console.log('Connected to MongoDB successfully');
      });
  } catch (error) {
    console.error('Database connection error:', error);
  }
};
export default dbConnection;
