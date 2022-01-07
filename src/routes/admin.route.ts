import express, { Router } from 'express';
import * as admin from '../controllers/admin.controller';

const router: Router = express.Router();

router.get('/', (_req,res,_next)=>{
    res.json('this is admin route')
})

router.post('/add-user', admin.postAddUser);


export default router;
