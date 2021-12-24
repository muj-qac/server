import express from "express"
import authController from "../Controllers/auth"


const router = express.Router();

router.get('/',authController.getSignUp);


export default router

   