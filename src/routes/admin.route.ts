import express, { Router } from 'express';
import * as admin from '../controllers/admin.controller';
import roles from './admin/role.route';

const router: Router = express.Router();

router.get('/', (_req, res, _next) => {
    console.log(_req.isAuthenticated(),_req.session);
    res.json({admin:_req.user});
})

router.post('/add-user', admin.postAddUser);

router.use('/roles', roles);

export default router;
