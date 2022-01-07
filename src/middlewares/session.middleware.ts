import { NextFunction, Request, Response } from "express";
import session from "express-session";



const sessionMiddleware = (req: Request, res: Response, next: NextFunction) => {
    return session({
        secret: "qac@MUJ",
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 2 * 60 * 60 * 1000/* 2 hours */, secure: false }
    })(req, res, next)
}

export default sessionMiddleware