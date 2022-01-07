import { hash } from 'bcryptjs';
import { Request, RequestHandler, Response } from 'express';
import { throwError } from '../helpers/ErrorHandler.helper';
import { asyncWrap } from '../middlewares/async.middleware';
import { User } from '../models/User.model';

const createUser = async (data) => {
  const {
    firstName,
    lastName,
    email,
    password,
    details,
    phoneNumber,
    role,
  } = data;

  // ============================================================
  // Validation
  // ============================================================
  if (!firstName || !email || !password || !role)
    throwError(400, 'Please provide all the information');

  const hashedPassword = await hash(password, 10);
  const isAdmin = role[0] === 'admin' ? true : false;
  return User.create({
    first_name: firstName,
    last_name: lastName,
    email,
    password: hashedPassword,
    details: {
      program: details.program,
      faculty: details.faculty,
      school: details.school,
      department: details.department,
    },
    phone_number: phoneNumber,
    role,
    is_admin: isAdmin,
  });
}

export const postAddUser: RequestHandler<any> = asyncWrap(
  async (req: Request, res: Response) => {
    try {
      const user = await createUser(req.body);
      await user.save();
      res.json(user);
    } catch (error) {
      console.error(error);
      throwError(400, 'Some Error Occured');
    }
  },
);
