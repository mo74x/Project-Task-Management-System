import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

const app: Application = express();

app.use(cors())
app.use(express.json())

//API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

//error handling middleware
app.use(notFoundHandler)
app.use(errorHandler)

export default app;