import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';

const app: Application = express();

app.use(cors())
app.use(express.json())

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ health: 'ok', message: "API is running" });
});

export default app;