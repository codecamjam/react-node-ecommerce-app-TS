import express, {
  Application,
  Request,
  Response,
  NextFunction
} from 'express';
import { createConnection } from 'typeorm';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './swagger';

// Initialize dotenv
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import categoryRoutes from './routes/category';
import productRoutes from './routes/product';
import braintreeRoutes from './routes/braintree';
import orderRoutes from './routes/order';
import expressValidator from 'express-validator';

// Initialize TypeORM connection
createConnection()
  .then(() => {
    console.log('DB Connected');

    // Initialize the app
    const app: Application = express();

    // Middlewares
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
    app.use(morgan('dev'));
    app.use(express.json());
    app.use(cookieParser());
    app.use(expressValidator());
    app.use(
      cors({ credentials: true, origin: ['http://localhost:3000'] })
    );

    // Routes middleware
    app.use('/api', authRoutes);
    app.use('/api', userRoutes);
    app.use('/api', categoryRoutes);
    app.use('/api', productRoutes);
    app.use('/api', braintreeRoutes);
    app.use('/api', orderRoutes);

    // Custom JSON Error handler
    app.use(
      (err: any, req: Request, res: Response, next: NextFunction) => {
        if (err) {
          console.error(err); // Log the error details

          return res.status(err.status || 400).json({
            error: {
              message: err.message || 'An error occurred.',
              details: err.errors || null
            }
          });
        }
        next();
      }
    );

    // Define the port
    const port = process.env.PORT || 8000;

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log('Swagger docs: http://localhost:8000/api-docs');
    });
  })
  .catch(err => {
    console.error('DB Connection Error:', err);
  });
