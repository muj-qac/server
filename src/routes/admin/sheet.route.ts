import express, { Router } from 'express';
import {
  getNewSheetData,
  downloadSheet,
} from '../../controllers/sheet.controller';
import {
  getObject,
  getUnverifiedKPIs,
  getVerifiedKPIs,
  verifyKPI,
} from '../../controllers/upload.controller';

const router: Router = express.Router();

router.post('/new', getNewSheetData);
router.get('/download/:id', downloadSheet);
router.get('/unverified-kpis', getUnverifiedKPIs);
router.get('/get-object', getObject);
router.get('/verify-kpi', verifyKPI);
router.get('/verified-kpi', getVerifiedKPIs);

export default router;
