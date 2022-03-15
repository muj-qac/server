import { compare, hash } from 'bcryptjs';
import { Request, RequestHandler, Response } from 'express';
import { throwError } from '../helpers/ErrorHandler.helper';
import { asyncWrap } from '../middlewares/async.middleware';
import { User } from '../models/User.model';

const createUser = async (data) => {
  const { firstName, lastName, email, password, details, phoneNumber, role } =
    data;

  // ============================================================
  // Validation
  // ============================================================
  if (!firstName || !email || !password || !role)
    throwError(400, 'Please provide all the information');

  const hashedPassword = await hash(password, 10);
  const is_admin =
    role.includes('admin') || role.includes('Admin') || role.includes('ADMIN')
      ? true
      : false;
  return User.create({
    first_name: firstName,
    last_name: lastName,
    email,
    password: hashedPassword,
    details,
    phone_number: phoneNumber,
    role,
    is_admin,
  });
};

const updateUser = async (existingEmail, data) => {
  const { details = null, ...rest } = data;
  const user = await User.findOne({ where: { email: existingEmail } });
  if (!user) return throwError(400, 'User Not Found');
  const { password, ...restUserDetails } = user;
  const updatedUser = {
    ...restUserDetails,
    ...rest,
    password,
    details: user?.details ? { ...user.details, ...details } : { ...details },
  };
  const is_admin =
    updatedUser.role.includes('admin') ||
    updatedUser.role.includes('Admin') ||
    updatedUser.role.includes('ADMIN')
      ? true
      : false;
  return User.update({ email: existingEmail }, { ...updatedUser, is_admin });
};

export const postAddUser: RequestHandler<any> = asyncWrap(
  async (req: Request, res: Response) => {
    try {
      const user = await createUser(req.body);
      await user.save();
      res.status(201).json(user);
    } catch (error) {
      console.error(error);
      throwError(400, 'error adding user');
    }
  },
);

export const getAllUser: RequestHandler<any> = asyncWrap(async (_req, res) => {
  try {
    const data = await User.find({
      select: ['id', 'first_name', 'email', 'last_name', 'role', 'details'],
    });
    res.status(200).json(data);
  } catch (error) {
    throwError(401, 'Some error occured');
  }
});

export const getSingleUser: RequestHandler<any> = asyncWrap(
  async (req, res) => {
    try {
      const { email } = req.params;
      const data = await User.find({
        select: [
          'id',
          'first_name',
          'email',
          'last_name',
          'phone_number',
          'details',
          'is_admin',
          'role',
        ],
        where: { email },
      });
      res.status(200).json(data);
    } catch (error) {
      throwError(404, 'User does not exist');
    }
  },
);

export const putUpdateUser: RequestHandler<any> = asyncWrap(
  async (req: Request, res: Response) => {
    try {
      const { email } = req.params;
      const user = await updateUser(email, req.body);
      res.status(205).json(user);
    } catch (error) {
      console.error(error);
      throwError(404, 'User does not exist');
    }
  },
);

export const deleteUser: RequestHandler<any> = asyncWrap(
  async (req: Request, res: Response) => {
    try {
      const { email } = req.params;
      const user = await User.delete({ email });
      res.status(201).json(user);
    } catch (error) {
      console.error(error);
      throwError(404, 'User not found');
    }
  },
);

export const getMyProfile: RequestHandler<any> = asyncWrap(
  async (req: Request, res: Response) => {
    try {
      const user: any = req.user;
      if (!user) throwError(401, 'You are not logged in');
      const data = await User.find({
        select: ['first_name', 'email', 'last_name', 'phone_number', 'details'],
        where: { id: user.id },
      });
      res.status(200).json(data);
    } catch (error) {
      throwError(404, 'User does not exist');
    }
  },
);

export const changeMyPassword: RequestHandler<any> = asyncWrap(
  async (req: Request, res: Response) => {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;
      const user: any = req.user;
      if (!oldPassword || !newPassword || !confirmPassword)
        throwError(406, 'Please provide all the fields.');
      if (!(newPassword === confirmPassword))
        throwError(400, "Given new passwords didn't match");
      const hashedPassword = await hash(newPassword, 10);
      const userData = await User.findOne({
        select: ['password'],
        where: { id: user.id },
      });
      console.log(userData);
      compare(oldPassword, userData!.password, async (err, result: boolean) => {
        if (err) throw err;
        if (!result) throwError(404, 'Given Password is wrong');
        const data = await User.update(
          { id: user.id },
          { password: hashedPassword },
        );
        res.status(200).json(data);
      });
    } catch (error) {
      throwError(404, error.message);
    }
  },
);
