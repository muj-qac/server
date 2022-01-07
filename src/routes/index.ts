import express from 'express';
import cookieParser from 'cookie-parser';

import sessionMiddleware from '../middlewares/session.middleware';
import passport from '../middlewares/passport.middleware'
import { isAdmin, isAuthenticated } from '../middlewares/auth.middeleware';
import authRoutes from './auth.route';
import adminRoutes from './admin.route';
import memberRoutes from './member.route';
import { throwError } from '../helpers/ErrorHandler.helper';


const api = express();
api.use(express.json());
api.use(express.urlencoded({ extended: true }));
api.use(sessionMiddleware);
api.use(cookieParser());
api.use(passport.initialize());
api.use(passport.session());

api.use('/auth', authRoutes);
api.use('/admin', isAdmin, adminRoutes);
api.use('/member', isAuthenticated, memberRoutes);
api.use('/', () => {
    throwError(404, "Route does not exist");
})

export default api;
