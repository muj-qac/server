import express from "express";
import * as user from "../../controllers/user.controller"


const router = express.Router();

router.get('/profile/:id', user.getSingleUser);

router.get('/all-user', user.getAllUser);

router.post('/add-user', user.postAddUser);

router.put('/profile/:id', user.putUpdateUser);

router.delete('/profile/:id', user.deleteUser);

export default router;