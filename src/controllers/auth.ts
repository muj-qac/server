import { RequestHandler } from 'express';
import { throwError } from '../helpers/ErrorHandler.helper';
import { asyncWrap } from '../middlewares/async.middleware';

export const getLogIn: RequestHandler<any> = asyncWrap(async (_req, res) => {
  try {
    res.status(200).json('This is signup');
  } catch (error) {
    console.error(error);
    throwError(400, 'Some error occurred.');
  }
});

export const postLogIn: RequestHandler<any> = asyncWrap(async (_req, res) => {
  try {
      res.status(200).json('Successfully logged In.');
  } catch (error) {
    console.error(error);
    throwError(400, 'Some error occurred.');
  }
});
