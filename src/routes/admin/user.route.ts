import express from "express";
import * as user from "../../controllers/user.controller"


const router = express.Router();

router.get('/:id');

router.get('/all-user');

router.post('/add-user', user.postAddUser);

router.put('/:id');

router.delete('/:id');

export default router;