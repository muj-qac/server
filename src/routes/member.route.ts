import { Router } from 'express';
import uploadRoutes from './upload.route';

const router = Router();

router.get('/my-profile');

router.get('/', (req, res, _next) => {
  res.send(req.user);
});

router.put('/change-password');

router.put('/update-profile');

router.use('/upload', uploadRoutes);

export default router;
