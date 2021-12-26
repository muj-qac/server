import express from 'express';
import authRoutes from './auth';
import builderRoutes from './builder';

const api = express();
api.use(express.json());
api.use(express.urlencoded({ extended: true }));

api.use('/builder', builderRoutes);
api.use('/auth', authRoutes);

export default api;
