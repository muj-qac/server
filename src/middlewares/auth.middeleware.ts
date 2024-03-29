import { NextFunction, Request, Response } from "express";
import { throwError } from "../helpers/ErrorHandler.helper";
import { User } from "../models/User.model";
import { asyncWrap } from "./async.middleware";


export const isAdmin = asyncWrap(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user }: any = req;
        if (!user) throwError(401, "Not logged In");
        const userInfo = await User.findOne({
            where: {
                email: user.email
            }
        });
        if (user.isAdmin && userInfo?.is_admin) next();
        else res.status(401).json("No admin permission");
    } catch (error) {
        console.error(error);
        throwError(401, "Please Log In");
    }
});

export const isAuthenticated = asyncWrap(async (req: Request, _res, next: NextFunction) => {
    try {
        if (!req.isAuthenticated()) throwError(401, "Please Log In");
        next();
    } catch (error) {
        throwError(401, "Unauthorised User")
    }
})