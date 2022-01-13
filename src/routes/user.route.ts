import { Router } from 'express';
import * as user from '../controllers/user.controller';
import { postKPI } from '../controllers/upload.controller';
import uploadMiddleware from '../middlewares/upload.middleware';

const router = Router();

router.get('/my-profile', user.getMyProfile);

router.get('/', (req, res, _next) => {
  res.send(req.user);
});

router.put('/change-password');

router.post('/upload/:kpi', uploadMiddleware.single('file'), postKPI);

export default router;
