import { Router } from "express";


const router = Router();

router.get('/my-profile')

router.get('/', (req, res, _next) => {
    res.send(req.user);
})

router.put('/change-password');

router.put('/update-profile');

export default router;