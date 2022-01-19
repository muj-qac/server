import express, { Router } from 'express';
import * as auth from '../controllers/auth.controller';
import passport from '../middlewares/passport.middleware';

const router: Router = express.Router();

router.post('/login', passport.authenticate('local'), auth.postLogIn);

router.post('/logout', auth.postLogOut);

router.get("/user", (req, res) => {
    res.status(400).json(req.user);
});

export default router;
