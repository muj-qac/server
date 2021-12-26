import express, { Router } from 'express';
import getSignUp from '../../../controllers/auth';

const router: Router = express.Router();

router.get('/', getSignUp);

export default router;
