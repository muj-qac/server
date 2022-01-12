import express, { Router } from 'express';
import { postKPI } from '../controllers/upload.controller';
import upload from '../middlewares/upload.middleware';

const router: Router = express.Router();

router.post('/:kpi', upload.single('file'), postKPI);

export default router;
