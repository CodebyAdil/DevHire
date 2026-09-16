import express from 'express';
import authRoutes from './features/auth/auth.routes.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);


app.use(notFound);
app.use(errorHandler);

export default app;