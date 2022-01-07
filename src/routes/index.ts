import express from 'express';
import cookieParser from 'cookie-parser';

import authRoutes from './auth.route';

import builderRoutes from './builder.route';
import adminRoutes from './admin.route';
import passport from '../middlewares/passport.middleware'
import sessionMiddleware from '../middlewares/session.middleware';


const api = express();
api.use(express.json());
api.use(express.urlencoded({ extended: true }));
api.use(sessionMiddleware);
api.use(cookieParser());
api.use(passport.initialize());
api.use(passport.session());


api.use('/auth', authRoutes);
api.use('/admin', adminRoutes);
api.use('/builder', builderRoutes);

export default api;
