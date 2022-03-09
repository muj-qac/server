import { RequestHandler } from 'express';

import { ajv } from '../config/ajv.config';

import { CellValidation } from '../types/sheet/validations';
import ApiResponse from '../types/api';

import { throwError } from '../helpers/ErrorHandler.helper';
import { asyncWrap } from '../middlewares/async.middleware';
import { isValidCellTypeInput, sheetSchemas } from '../validators/sheet';
import { buildSheet } from '../handlers/sheetBuilder.handler';
import { downloadGoogleSheet } from '../handlers/sheetDownloader.handler';
import { KpiData } from '../models/KpiData.model';
import { UploadedSheet } from '../models/UploadedSheet.model';
import { User } from '../models/User.model';

export const getNewSheetData: RequestHandler = asyncWrap(async (req, res) => {
  try {
    const title: string = req.body.title;
    const columns: CellValidation[] = req.body.columns;

    // validates the input json
    columns.forEach((column) => {
      // check if cell is valid
      ajv.validate(isValidCellTypeInput, column);
      if (ajv.errors) throwError(400, JSON.stringify(ajv.errors));

      // validate cell rules
      if (column.rule) {
        ajv.validate(sheetSchemas[column.type], column.rule);
        if (ajv.errors) throwError(400, JSON.stringify(ajv.errors));
      }
    });

    const result = await buildSheet(title, columns);
    if (!result?.success) throwError(500, 'Error building the sheet.');

    const data: any = result?.data;
    if (!data.id) throwError(500, 'Error building the sheet.');
    const kpiData = await KpiData.create({
      name: title,
      schema: columns,
      sheet_id: data.id,
    }).save();
    res.json({ status: 200, data: kpiData, success: true } as ApiResponse);
  } catch (error) {
    console.log(error);
    throwError(500, `Some error occurred.`);
  }
});

export const downloadSheet: RequestHandler = asyncWrap(async (req, res) => {
  try {
    const sheetId = req.params.id;
    console.log(sheetId);
    const data = await downloadGoogleSheet(sheetId);
    if (!data) {
      res.send('oops');
      return;
    }
    if (!data.data) {
      res.send('oops');
      return;
    }
    res.attachment('sheet.xlsx');
    data.data.pipe(res);
  } catch (error) {
    console.log(error);
    return;
  }
});

export const getVerifiedKPIsForUser: RequestHandler<any> = asyncWrap(
  async (req, res) => {
    try {
      const currentUser: any = req.user;
      const user = await User.findOne({ where: { id: currentUser.id } });
      const verifiedKpis = await UploadedSheet.find({
        relations: ['user'],
        where: { user, status: 'verified' },
      });
      res.status(200).json(verifiedKpis);
    } catch (error) {
      throwError(500, error.message);
    }
  },
);
