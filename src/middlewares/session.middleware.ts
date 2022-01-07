import session from "express-session";


const sessionMiddleware = session({
    secret: "secretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000/* 24 hours */,
        secure: false
    }
})

export default sessionMiddleware