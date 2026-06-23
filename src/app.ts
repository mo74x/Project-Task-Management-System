import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/swagger.json';

const app: Application = express();

app.use(cors())
app.use(express.json())

//Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


//API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

//error handling middleware
app.use(notFoundHandler)
app.use(errorHandler)

export default app;