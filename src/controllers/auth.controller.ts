import { RequestHandler } from 'express';
import { throwError } from '../helpers/ErrorHandler.helper';
import { asyncWrap } from '../middlewares/async.middleware';

export const getLogIn: RequestHandler<any> = asyncWrap(async (_req, res) => {
  try {
    res.status(200).json(_req.session);
  } catch (error) {
    console.error(error);
    throwError(400, 'Some error occurred.');
  }
});

export const postLogIn: RequestHandler<any> = asyncWrap(async (_req, res, _next) => {
  try {
    if (!_req.user) return;
    console.log(_req.isAuthenticated(), _req.session);
    res.status(200).redirect('/api/v1/auth/login');
  } catch (error) {
    console.error(error);
    throwError(400, 'Some error occurred.');
  }
});
