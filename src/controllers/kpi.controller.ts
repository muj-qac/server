import { Request, RequestHandler, Response } from "express";
import { throwError } from "../helpers/ErrorHandler.helper";
import { asyncWrap } from "../middlewares/async.middleware";
import { KpiAllocation } from "../models/KpiAllocation.model"
import { KpiData } from "../models/KpiData.model";



export const getAllKpi: RequestHandler<any> = asyncWrap(async (_req, res) => {
    try {
        const data = await KpiData.find({ select: ['id', 'name', 'allocation'] });
        res.status(200).json(data);
    } catch (error) {
        throwError(401, "Some error occured");
    }
});


export const postAllocateRoles: RequestHandler<any> = asyncWrap(async (req: Request, res: Response) => {
    try {
        const { roles, status, kpiId } = req.body;
        const kpiData = await KpiData.findOne({ id: kpiId });
        if (!kpiData) throwError(400, "Kpi Id does not exist");
        const allocation = KpiAllocation.create({
            allocated_to_roles: roles,
            status,
            kpiData
        });
        const kpidataData = await KpiData.update({ id: kpiId }, { allocation })
        const data = await allocation.save();
        console.log(kpiData,kpidataData);
        res.status(200).json(data);
    } catch (error) {
        throwError(401, "Entry Already exist");
    }
});

export const putUpdateRoles: RequestHandler<any> = asyncWrap(
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { roles, status, kpiId } = req.body;
            const data = await KpiAllocation.update({ id }, {
                allocated_to_roles: roles,
                status,
                kpiData: kpiId
            })
            res.status(205).json(data);
        } catch (error) {
            console.error(error);
            throwError(404, 'User does not exist');
        }
    }
);
