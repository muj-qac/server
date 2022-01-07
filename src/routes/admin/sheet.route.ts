import express, { Router } from 'express';
import {
  getNewSheetData,
  downloadSheet,
} from '../../controllers/sheet.controller';

const router: Router = express.Router();

router.post('/new', getNewSheetData);
router.get('/download/:id', downloadSheet);

export default router;
