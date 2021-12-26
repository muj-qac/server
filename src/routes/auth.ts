import express, { Router } from 'express';
import * as auth from '../controllers/auth';

const router: Router = express.Router();

router.get('/', auth.getSignUp);

export default router;
