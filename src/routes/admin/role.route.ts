import express,{ Router } from "express";


const router:Router=express.Router();

router.get('/get-roles');

router.post('/add-roles');

router.delete('/delete-role');

export default router;