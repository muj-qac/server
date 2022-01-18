import express, { Router } from 'express';
import kpiRoutes from './admin/kpi.route';
import roleRoutes from './admin/role.route';
import sheetRoutes from './admin/sheet.route'
import userRoutes from './admin/user.route'

const router: Router = express.Router();

router.get('/', (_req, res, _next) => {
    res.json({ admin: _req.user });
})

router.use('/user', userRoutes);

router.use('/role', roleRoutes);

router.use('/sheet', sheetRoutes);

router.use('/kpi', kpiRoutes);

export default router;
