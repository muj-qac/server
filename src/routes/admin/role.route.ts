import express,{ Router } from "express";


const router:Router=express.Router();


router.get('/get-roles');

router.post('/add-roles');

router.put('/update-role');

router.delete('/delete-role');

export default router;