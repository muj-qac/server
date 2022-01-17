import { RequestHandler } from "express";
import { throwError } from "../helpers/ErrorHandler.helper";
import { asyncWrap } from "../middlewares/async.middleware";
import { Role } from "../models/Role.model";


export const getAllrole: RequestHandler<any> = asyncWrap(async (_req, res) => {
    try {
        const roles = await Role.find({ select: ['role_name'], order: { role_name: "ASC" } });
        res.status(200).json(roles);
    } catch (error) {
        throwError(401, "Some error occured");
    }
});

export const postAddRole: RequestHandler<any> = asyncWrap(async (req, res) => {
    try {
        const { roleName } = req.body;
        const role = await Role.create({ role_name: roleName });
        const data = await role.save()
        res.status(200).json(data);
    } catch (error) {
        throwError(401, "Some error occured");
    }
});


// ============================================================
// Please give warning regarding no user/kpi have that role
// ============================================================
export const deleteRole: RequestHandler<any> = asyncWrap(async (req, res) => {
    try {
        const { name } = req.params;
        const data = await Role.delete({ role_name: name });
        res.status(200).json(data);
    } catch (error) {
        throwError(401, "Some error occured");
    }
});
