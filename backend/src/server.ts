
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Route
app.get('/', (req: Request, res: Response) => {
    res.send('EcoImpactAI Backend is running!');
});

// Database Connection
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import analysisRoutes from './routes/analysis.routes';
import userRoutes from './routes/user.routes';

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analyze', analysisRoutes);
app.use('/api/user', userRoutes);

// Start Server
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;
