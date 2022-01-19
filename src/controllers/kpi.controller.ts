import { Request, RequestHandler, Response } from "express";
import { throwError } from "../helpers/ErrorHandler.helper";
import { asyncWrap } from "../middlewares/async.middleware";
import { KpiAllocation } from "../models/KpiAllocation.model"
import { KpiData } from "../models/KpiData.model";
import { User } from "../models/User.model";



export const getAllKpi: RequestHandler<any> = asyncWrap(async (_req, res) => {
    try {
        const data = await KpiData.find({ select: ['id', 'name'] });
        res.status(200).json(data);
    } catch (error) {
        throwError(401, "Some error occured");
    }
});


export const testKpi: RequestHandler<any> = asyncWrap(async (_req, res) => {
    try {
        const { id } = _req.body;
        const data = await KpiData.findOne({ where: { id } })
        res.status(200).json({ data, id });
    } catch (error) {
        throwError(401, error);
    }
});

export const postAllocateRoles: RequestHandler<any> = asyncWrap(async (req: Request, res: Response) => {
    try {
        const { roles, status, kpiId } = req.body;
        console.log(roles, status, typeof (kpiId));
        const kpiData = await KpiData.findOne({ where: { id: kpiId } });
        if (!kpiData) throwError(400, "Kpi Id does not exist");
        const allocation = KpiAllocation.create({
            allocated_to_roles: roles,
            status,
            kpiData
        });
        const data = await allocation.save();
        res.status(200).json(data);
    } catch (error) {
        throwError(401, error);
    }
});

export const putUpdateRoles: RequestHandler<any> = asyncWrap(
    async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { ...data } = req.body;
            const kpi = await KpiAllocation.findOne({ where: { id } });
            if (!kpi) throwError(404, "Kpi Not found");
            const updatedKpi = { ...kpi, ...data };
            const update = await KpiAllocation.update({ id }, updatedKpi);
            res.status(205).json(update);
        } catch (error) {
            console.error(error);
            throwError(404, error);
        }
    }
);

export const getAllocatedKpi: RequestHandler<any> = asyncWrap(async (_req, res) => {
    try {
        const user: any = _req.user;
        if (!user) throwError(400, "User not found");
        const userRoles = await User.findOne({ select: ['role'], where: { id: user.id } });
        const kpiRoles = await KpiAllocation.find();
        // userRoles?.role.map(role => {

        // })
        res.status(200).json({ userRoles, kpiRoles });
    } catch (error) {
        throwError(401, error);
    }
});