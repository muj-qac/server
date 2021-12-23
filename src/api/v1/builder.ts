import express from 'express';
import { asyncWrap } from '../../middlewares/async.middleware';
import { throwError } from '../../helpers/ErrorHandler.helper';

const builder = express();
builder.use(express.json());
builder.use(express.urlencoded({ extended: true }));

builder.post(
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

export default builder;
