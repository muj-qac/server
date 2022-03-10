import dotenv from 'dotenv';
dotenv.config();

import { RequestHandler } from 'express';

import { ajv } from '../config/ajv.config';

import aws from 'aws-sdk';

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
import { RejectedKpi } from '../models/RejectedKpi.model';

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
      const resData: any = [];
      const currentUser: any = req.user;
      const user = await User.findOne({ where: { id: currentUser.id } });
      const verifiedKpis = await UploadedSheet.find({
        relations: ['user', 'allocated'],
        select: ['id', 'aws_key', 'allocated'],
        where: { user, status: 'verified' },
      });
      await Promise.all(
        verifiedKpis.map(async (obj) => {
          let resKpi = {};
          const allocation = obj.allocated;
          const kpiData = await KpiData.findOne({
            relations: ['allocation'],
            where: { allocation },
          });
          resKpi = { ...obj, name: kpiData!.name };
          resData.push(resKpi);
        }),
      );
      res.status(200).json(resData);
    } catch (error) {
      throwError(500, error.message);
    }
  },
);

export const getRejectedKPIsForUser: RequestHandler<any> = asyncWrap(
  async (req, res) => {
    try {
      const resData: any = [];
      const user = req.user;
      const rejectedKpis = await UploadedSheet.find({
        relations: ['user', 'allocated'],
        select: ['id'],
        where: { user, status: 'rejected' },
      });
      await Promise.all(rejectedKpis.map(async (obj) => {
        const rejectedData = await RejectedKpi.findOne({ relations: ['uploadedSheet'], where: { uploadedSheet: obj } });
        const kpiData = await KpiData.findOne({ relations: ['allocation'], where: { allocation: obj.allocated } })
        resData.push({ ...rejectedData, name: kpiData!.name });
      }));
      res.status(200).json(resData);
    } catch (error) {
      throwError(500, error.message);
    }
  },
);

const s3 = new aws.S3({
  accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
  secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
  signatureVersion: 'v4',
});

const getFileStream = (key, bucket) => {
  const fileParams = {
    Key: key,
    Bucket: bucket,
  };
  return s3.getObject(fileParams).createReadStream();
};

export const downloadVerifiedKpi: RequestHandler<any> = asyncWrap(
  async (_req, res, _next) => {
    try {
      const objectKey = _req.params.fileKey;
      const bucket = `${process.env.AWS_BUCKET_NAME_VERIFIED}`;
      const readStream = getFileStream(objectKey, bucket);
      res.attachment(`${objectKey}.xlsx`);
      readStream.pipe(res);
    } catch (error) {
      console.error(error);
      throwError(400, 'Some error occurred.');
    }
  },
);
