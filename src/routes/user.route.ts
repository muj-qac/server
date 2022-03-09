import { Router } from 'express';
import * as user from '../controllers/user.controller';
import * as kpi from '../controllers/kpi.controller';
import { getVerifiedObject } from '../controllers/upload.controller';
import uploadMiddleware from '../middlewares/upload.middleware';
import { getRejectedKPIs, postKPI } from '../controllers/upload.controller';
import { downloadSheet } from '../controllers/sheet.controller';
import { getVerifiedKPIsForUser } from '../controllers/sheet.controller';

const router = Router();

router.get('/my-profile', user.getMyProfile);

router.get('/', (req, res) => {
  res.send(req.user);
});

router.put('/change-password', user.changeMyPassword);

router.get('/alloted-kpi', kpi.getAllocatedKpi);

router.get('/download/:id', downloadSheet);

router.post('/upload/:kpiId', uploadMiddleware.single('file'), postKPI);

router.get('get-rejected-kpis', getRejectedKPIs);

router.get('/get-verified-kpi', getVerifiedKPIsForUser);

router.get('/download-verified-kpi/:fileKey', getVerifiedObject);

export default router;
