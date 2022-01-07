import express, { Router } from 'express';
import * as auth from '../controllers/auth.controller';
import passport from '../middlewares/passport.middleware';

const router: Router = express.Router();

router.get('/login', auth.getLogIn);

router.post('/login', passport.authenticate('local'), auth.postLogIn);

export default router;
