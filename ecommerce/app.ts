import express, { Application } from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
// Initialize dotenv
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import categoryRoutes from './routes/category';
import productRoutes from './routes/product';
import braintreeRoutes from './routes/braintree';
import orderRoutes from './routes/order';

// Initialize the app
const app: Application = express();

// Database connection
mongoose
  .connect(process.env.DATABASE as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB Connected'))
  .catch(err => console.error('DB Connection Error:', err));

// Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Routes middleware
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', braintreeRoutes);
app.use('/api', orderRoutes);

// Define the port
const port = process.env.PORT || 8000;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
