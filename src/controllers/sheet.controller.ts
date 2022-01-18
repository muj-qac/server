import { RequestHandler } from 'express';

import { ajv } from '../config/ajv.config';

import { CellValidation } from '../types/sheet/validations';
import ApiResponse from '../types/api';

import { throwError } from '../helpers/ErrorHandler.helper';
import { asyncWrap } from '../middlewares/async.middleware';
import { isValidCellTypeInput, sheetSchemas } from '../validators/sheet';
import { buildSheet } from '../handlers/sheetBuilder.handler';
import { downloadGoogleSheet } from '../handlers/sheetDownloader.handler';
import { Readable } from 'stream';

export const getNewSheetData: RequestHandler = asyncWrap(async (req, res) => {
  try {
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

    const result = await buildSheet(columns);
    if (!result?.success) throwError(500, 'Error building the sheet.');

    // TODO: generate the sheet download link
    // TODO: save the details in the db

    res.json({ status: 200, data: result?.data, success: true } as ApiResponse);
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
    res.attachment('sheet.xlsx');
    if (!data) {
      res.send('oops');
      return;
    }
    if (!data.data) {
      res.send('oops');
      return;
    }
    let buffer = Buffer.from(`${data.data}`, 'utf8');
    let stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    stream.pipe(res);
  } catch (error) {
    console.log(error);
    return;
  }
});
