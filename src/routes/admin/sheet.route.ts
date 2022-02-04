import express, { Router } from 'express';
import {
  getNewSheetData,
  downloadSheet,
} from '../../controllers/sheet.controller';
import * as kpi from '../../controllers/upload.controller';

const router: Router = express.Router();

router.post('/new', getNewSheetData);
router.get('/download/:id', downloadSheet);
router.get('/unverified-kpis', kpi.getUnverifiedKPIs);
router.get('/get-unverified-object', kpi.getUnverifiedObject);
router.put('/verify-kpi', kpi.verifyKPI);
router.get('/verified-kpis', kpi.getVerifiedKPIs);
router.get('/get-verified-object', kpi.getVerifiedObject);
router.get('/update-mainkpi', kpi.updateMainKPI);
router.put('/reject-kpis', kpi.rejectKPI);
router.get('/get-rejected-object', kpi.getRejectedObject);

export default router;
