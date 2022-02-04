import { RequestHandler } from 'express';
import { throwError } from '../helpers/ErrorHandler.helper';
import { asyncWrap } from '../middlewares/async.middleware';

export const postLogIn: RequestHandler<any> = asyncWrap(async (_req, res, _next) => {
  try {
    const user: any = _req.user;
    res.status(200).json({ id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, isAdmin: user.is_admin });
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