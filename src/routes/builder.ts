import express, { Router } from 'express';
import { getNewSheetData } from '../controllers/builder';

const router: Router = express.Router();

router.post('/new', getNewSheetData);

export default router;
