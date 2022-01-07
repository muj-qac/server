import { RequestHandler } from 'express';
import { throwError } from '../helpers/ErrorHandler.helper';
import { asyncWrap } from '../middlewares/async.middleware';


export const postLogIn: RequestHandler<any> = asyncWrap(async (_req, res, _next) => {
  try {
    if (!_req.user) return;
    res.status(200).json("Sucessfully Logged In");
  } catch (error) {
    console.error(error);
    throwError(400, 'Some error occurred.');
  }
});

export const postLogOut: RequestHandler<any> = asyncWrap(async (req, res) => {
  try {
    req.logOut();
    res.status(201).json("Logged Out Sucessfully.");
  } catch (error) {
    throwError(400, "Error occurd during logout")
  }
})