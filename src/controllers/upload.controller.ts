import { RequestHandler } from 'express';
import { throwError } from '../helpers/ErrorHandler.helper';
import { asyncWrap } from '../middlewares/async.middleware';

export const postKPI: RequestHandler<any> = asyncWrap(
  async (req, res, _next) => {
    try {
      res.status(200).json({
        data: req.file,
        msg: 'Successfully uploaded ' + req.file?.originalname + ' files!',
      });
    } catch (error) {
      console.error(error);
      throwError(400, 'Some error occurred.');
    }
  },
);
