import express from 'express';
import authRoutes from './auth';
import builderRoutes from './sheet.route';

const api = express();
api.use(express.json());
api.use(express.urlencoded({ extended: true }));

api.use('/sheet', builderRoutes);
api.use('/auth', authRoutes);

export default api;
