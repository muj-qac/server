import { Request, RequestHandler, Response } from "express";
import { throwError } from "../helpers/ErrorHandler.helper";
import { asyncWrap } from "../middlewares/async.middleware";
import { KpiAllocation } from "../models/KpiAllocation.model"
import { KpiData } from "../models/KpiData.model";
import { statusTypes, UploadedSheet } from "../models/UploadedSheet.model";
import { User } from "../models/User.model";


const changeUploadedKpiStatus = async (allocated) => {
    try {
        const uploadedKpis = await UploadedSheet.find({ select: ['id', 'status'], where: { allocated } })
        uploadedKpis?.forEach(async (uploadedKpi) => {
            await UploadedSheet.update({ id: uploadedKpi.id }, { status: statusTypes.PENDING })
        })
    } catch (error) {
        throwError(401, error);
    }
};


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
        const kpiData = await KpiData.findOne({ where: { id: kpiId } });
        if (!kpiData) throwError(400, "Kpi Id does not exist");
        const allocation = KpiAllocation.create({
            allocated_to_roles: roles,
            status,
            kpiData
        });
        const data = await allocation.save();
        await KpiData.update({ id: kpiId }, { allocation: data })
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
            const kpiData = await KpiData.findOne({ where: { id } });
            const allocated = await KpiAllocation.findOne({ where: { kpiData } });
            if (!allocated) throwError(404, "Kpi Not found");
            const updatedKpi = { ...allocated, ...data };
            if (updatedKpi.status) changeUploadedKpiStatus(allocated);
            const update = await KpiAllocation.update({ id: allocated!.id }, updatedKpi);
            res.status(205).json(update);
        } catch (error) {
            console.error(error);
            throwError(404, error);
        }
    }
);

export const getAllocatedKpi: RequestHandler<any> = asyncWrap(async (_req, res) => {
    try {
        const reqUser: any = _req.user;
        if (!reqUser) throwError(400, "User not found");
        const user = await User.findOne({ where: { id: reqUser.id } });
        const allocated = await KpiAllocation.find({ relations: ['kpiData'] });
        const allocatedKpiData = new Set();
        user?.role.forEach(role => {
            for (const allocatedKpi of allocated) {
                if (allocatedKpi.allocated_to_roles.includes(role)) {
                    allocatedKpiData.add(allocatedKpi)
                }
            }
        })
        const responseData: any = [];
        for (const allocated of allocatedKpiData) {
            let responseKpi = {}
            const uploadedSheet = await UploadedSheet.findOne({ relations: ['user', 'allocated'], where: { user, allocated } });
            if (!uploadedSheet) responseKpi['status'] = statusTypes.PENDING;
            else responseKpi['status'] = uploadedSheet.status;
            responseKpi = { ...responseKpi, ...allocated.kpiData }
            delete responseKpi['schema'];
            responseData.push(responseKpi);
        }
        res.status(200).json(responseData);
    } catch (error) {
        throwError(401, error);
    }
});