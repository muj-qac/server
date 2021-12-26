import { RequestHandler } from 'express';
import { throwError } from '../helpers/ErrorHandler.helper';
import { asyncWrap } from '../middlewares/async.middleware';

export const getSignUp: RequestHandler<any> = asyncWrap(async (_req, res) => {
  try {
    res.status(200).json('This is signup');
  } catch (error) {
    console.log(error);
    throwError(400, 'Some error occurred.');
  }
});
