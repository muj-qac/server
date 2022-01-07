import express, { Router } from 'express';
import roleRoutes from './admin/role.route';
import builderRoutes from './admin/builder.route'
import userRoutes from './admin/user.route'

const router: Router = express.Router();

router.get('/', (_req, res, _next) => {
    res.json({ admin: _req.user });
})

router.use('/user', userRoutes);

router.use('/role', roleRoutes);

router.use('/builder', builderRoutes);


export default router;
