import { Router } from "express";
import * as user from '../controllers/user.controller'


const router = Router();

router.get('/my-profile', user.getMyProfile);

router.get('/', (req, res, _next) => {
    res.send(req.user);
});

router.put('/change-password');

export default router;
