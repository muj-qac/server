import express, { Router } from 'express';
import { getNewSheetData } from '../controllers/builder.controller';

const router: Router = express.Router();

router.post('/new', getNewSheetData);

export default router;
