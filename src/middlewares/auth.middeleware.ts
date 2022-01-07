import { NextFunction, Request, Response } from "express";
import { throwError } from "../helpers/ErrorHandler.helper";
import { User } from "../models/User.model";


export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user }: any = req;
        if (!user) return res.status(401).json("Not logged in");
        const userInfo = await User.findOne({
            where: {
                email: user.email
            }
        });
        if (userInfo?.is_admin) next();
        else res.status(401).json("No admin permission");
    } catch (error) {
        console.error(error);
        throwError(400, "error in auth middleware");
    }
}