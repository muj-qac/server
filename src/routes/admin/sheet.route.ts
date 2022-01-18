import express, { Router } from 'express';
import {
  getNewSheetData,
  downloadSheet,
} from '../../controllers/sheet.controller';
import {
  getUnverifiedKPIs,
  getUnverifiedObject,
  getVerifiedKPIs,
  updateMainKPI,
  verifyKPI,
} from '../../controllers/upload.controller';

const router: Router = express.Router();

router.post('/new', getNewSheetData);
router.get('/download/:id', downloadSheet);
router.get('/unverified-kpis', getUnverifiedKPIs);
router.get('/get-unverified-object', getUnverifiedObject);
router.get('/verify-kpi', verifyKPI);
router.get('/verified-kpi', getVerifiedKPIs);
router.get('/update-mainkpi', updateMainKPI);

export default router;
