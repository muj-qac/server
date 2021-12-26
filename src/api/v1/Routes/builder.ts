import express, { Router } from 'express';
import { asyncWrap } from '../../../middlewares/async.middleware';
import { throwError } from '../../../helpers/ErrorHandler.helper';

const router: Router = express.Router();

router.post(
  '/new',
  asyncWrap(async (_req, res) => {
    try {
      res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      throwError(400, 'Some error occurred.');
    }
  }),
);

router.get('/', (_, res: any) => {
  res.send('Hello World');
});

export default router;
