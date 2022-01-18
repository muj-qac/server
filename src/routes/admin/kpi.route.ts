import express, { Router } from "express";
import * as kpi from "../../controllers/kpi.controller"

const router: Router = express.Router();


router.get('/get-kpis', kpi.getAllKpi);


router.post('/allocate-roles', kpi.postAllocateRoles);


router.put('/allocate-roles/:id', kpi.putUpdateRoles);


export default router;