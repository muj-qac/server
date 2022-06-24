import express, { Router } from 'express';
import { getNewSheetData } from '../../controllers/sheet.controller';
import * as kpi from '../../controllers/upload.controller';
import { uploadMiddlewareAdmin } from '../../middlewares/uploadAdmin.middleware';

const router: Router = express.Router();

router.post('/new', getNewSheetData);

router.get('/unverified-kpis', kpi.getUnverifiedKPIs);
router.get('/get-unverified-object/:objectKey', kpi.downloadUnverifiedObject);
router.get('/get-verified-object/:objectKey', kpi.downloadVerifiedObject);
router.put('/verify-kpi', kpi.verifyKPI);
router.get('/verified-kpis', kpi.getVerifiedKPIs);
router.get('/update-mainkpi/:kpiId', kpi.updateMainKPI);
router.post(
  '/reject-kpi/:userId',
  uploadMiddlewareAdmin.single('file'),
  kpi.rejectKPI,
);
router.get('/rejected-kpis', kpi.getRejectedKPIs);
router.get('/get-rejected-object/:fileKey', kpi.getRejectedObject);
router.get('/get-merged-object/:fileKey', kpi.downloadMergedKPI);

export default router;
