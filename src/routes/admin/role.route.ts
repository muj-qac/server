import express, { Router } from "express";
import * as role from '../../controllers/role.controller'


const router: Router = express.Router();

router.get('/get-roles', role.getAllrole);

router.post('/add-roles', role.postAddRole);

router.delete('/delete-role/:name', role.deleteRole);

export default router;