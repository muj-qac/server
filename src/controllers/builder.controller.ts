import { RequestHandler } from 'express';
import { ajv } from '../config/ajv.config';
import { asyncWrap } from '../middlewares/async.middleware';
import { throwError } from '../helpers/ErrorHandler.helper';

import { CellValidation } from '../types/sheet/validations';
import { isValidCellTypeInput, sheetSchemas } from '../validators/sheet';

export const getNewSheetData: RequestHandler = asyncWrap(async (req, res) => {
  try {
    let columns: CellValidation[] = req.body.columns;

    columns.forEach((column) => {
      console.log(column);
      ajv.validate(isValidCellTypeInput, column);
      if (ajv.errors) throw ajv.errors;

      if (column.rule) {
        ajv.validate(sheetSchemas[column.type], column.rule);
        if (ajv.errors) throw ajv.errors;
      }
    });

    res
      .status(200)
      .json({ success: true, response: columns, errors: ajv.errors });
  } catch (error) {
    console.log(error);
    throwError(400, `Some error occurred. ${JSON.stringify(error)}`);
  }
});
