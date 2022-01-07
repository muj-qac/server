import express from 'express';
import cookieParser from 'cookie-parser';

import authRoutes from './auth';

import builderRoutes from './builder.route';
import adminRoutes from './admin'; 
import passport from'../middlewares/passportConfig'
import sessionMiddleware from '../middlewares/session';


const api = express();
api.use(express.json());
api.use(express.urlencoded({ extended: true }));
api.use(sessionMiddleware);
api.use(cookieParser());
api.use(passport.initialize());
api.use(passport.session());


api.use('/auth',authRoutes);
api.use('/admin', adminRoutes);
api.use('/builder', builderRoutes);

export default api;
