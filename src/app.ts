import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';

const app: Application = express();

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
    res.status(200).json({ health: 'ok', message: "API is running" });
});

export default app;