import { Router } from 'express';
import * as user from '../controllers/user.controller';
import * as kpi from '../controllers/kpi.controller';
import uploadMiddleware from '../middlewares/upload.middleware';
import { downloadRejectedKPIsForUsers, postKPI } from '../controllers/upload.controller';
import {
  downloadSheet,
  downloadVerifiedKpi,
  getRejectedKPIsForUser,
} from '../controllers/sheet.controller';
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

router.get('/get-rejected-kpis', getRejectedKPIsForUser);

router.get('/get-verified-kpi', getVerifiedKPIsForUser);

router.get('/download-verified-kpi/:fileKey', downloadVerifiedKpi);

router.get('/download-rejected-kpi/:fileKey', downloadRejectedKPIsForUsers);


export default router;
