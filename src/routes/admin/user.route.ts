import express from "express";
import * as user from "../../controllers/user.controller"


const router = express.Router();

router.get('/profile/:email', user.getSingleUser);

router.get('/all-user', user.getAllUser);

router.post('/add-user', user.postAddUser);

router.put('/profile/:email', user.putUpdateUser);

router.delete('/profile/:email', user.deleteUser);

export default router;