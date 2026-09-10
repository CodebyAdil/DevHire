import authRoutes from './features/auth/auth.routes.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

app.use(express.json());
app.use('/api/auth', authRoutes);


app.use(notFound);
app.use(errorHandler);

export default app;