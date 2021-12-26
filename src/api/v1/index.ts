import express from 'express';
import { authRoutes, builderRoutes } from './routes';

const api = express();
api.use(express.json());
api.use(express.urlencoded({ extended: true }));

api.use('/builder', builderRoutes);
api.use('/auth', authRoutes);

export default api;
