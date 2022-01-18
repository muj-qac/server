import dotenv from 'dotenv';
dotenv.config();
import { RequestHandler } from 'express';
import { throwError } from '../helpers/ErrorHandler.helper';
import { asyncWrap } from '../middlewares/async.middleware';
import aws from 'aws-sdk';
import xlsx from 'xlsx';

const s3 = new aws.S3({
  accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
  secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
  signatureVersion: 'v4',
});

let bucketParams = {
  Bucket: `${process.env.AWS_BUCKET_NAME}`,
};

let verifiedBucketParams = {
  Bucket: `${process.env.AWS_BUCKET_NAME_VERIFIED}`,
};

export const postKPI: RequestHandler<any> = asyncWrap(
  async (req, res, _next) => {
    try {
      res.status(200).json({
        data: req.file,
        msg: 'Successfully uploaded ' + req.file?.originalname + ' files!',
      });
    } catch (error) {
      console.error(error);
      throwError(400, 'Some error occurred.');
    }
  },
);

export const getUnverifiedKPIs: RequestHandler<any> = asyncWrap(
  async (_req, res, _next) => {
    try {
      s3.listObjects(bucketParams, function (err, data) {
        if (err) {
          res.status(404).json({ Error: err });
        } else {
          res.status(200).json({ Success: data });
        }
      });
    } catch (error) {
      console.error(error);
      throwError(400, 'Some error occurred.');
    }
  },
);

const getFileStream = (key, bucket) => {
  let fileParams = {
    Key: key,
    Bucket: bucket,
  };
  return s3.getObject(fileParams).createReadStream();
};

export const getUnverifiedObject: RequestHandler<any> = asyncWrap(
  async (_req, res, _next) => {
    try {
      const objectKey = _req.body.fileKey;
      const bucket = `${process.env.AWS_BUCKET_NAME}`;
      const readStream = getFileStream(objectKey, bucket);
      res.attachment('sheet.xlsx');
      readStream.pipe(res);
    } catch (error) {
      console.error(error);
      throwError(400, 'Some error occurred.');
    }
  },
);

export const verifyKPI: RequestHandler<any> = asyncWrap(
  async (_req, res, _next) => {
    try {
      const key = _req.body.fileKey;
      const kpiParamsToVerify = {
        Bucket: `${process.env.AWS_BUCKET_NAME_VERIFIED}`,
        CopySource: `/${process.env.AWS_BUCKET_NAME}/${key}`,
        Key: key,
      };
      const kpiParams = {
        Bucket: `${process.env.AWS_BUCKET_NAME}`,
        Key: key,
      };
      s3.copyObject(kpiParamsToVerify, function (err, data) {
        if (err) res.status(400).json({ err });
        else res.status(200).json({ data });
      });
      s3.deleteObject(kpiParams, function (err, data) {
        if (err) console.log({ err });
        else console.log({ data });
      });
    } catch (error) {
      console.error(error);
      throwError(400, 'Some error occurred.');
    }
  },
);

//! ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export const updateMainKPI: RequestHandler<any> = asyncWrap(
  async (_req, res, _next) => {
    try {
      const key = _req.body.fileKey;
      const bucket = `${process.env.AWS_BUCKET_NAME_VERIFIED}`;
      const params = {
        Bucket: bucket,
        Key: key,
      };
      let file = s3.getObject(params).createReadStream();
      let buffers: any[] = [];

      file.on('data', function (data) {
        buffers.push(data);
      });
      file.on('end', function () {
        let buffer = Buffer.concat(buffers);
        let verifiedSheetData = xlsx.read(buffer);
        let verifiedSheetJson: any = xlsx.utils.sheet_to_json(
          verifiedSheetData.Sheets[0],
        );
        const modifiedWorkbook = xlsx.utils.book_new();
        let sheet = xlsx.utils.book_append_sheet(
          verifiedSheetJson,
          modifiedWorkbook,
          'kpiName',
        );
        console.log(verifiedSheetJson);
        res.send(sheet);
      });
    } catch (error) {
      console.error(error);
      throwError(400, 'Some error occurred.');
    }
  },
);

export const getVerifiedKPIs: RequestHandler<any> = asyncWrap(
  async (_req, res, _next) => {
    try {
      s3.listObjects(verifiedBucketParams, function (err, data) {
        if (err) {
          res.status(404).json({ Error: err });
        } else {
          res.status(200).json({ Success: data });
        }
      });
    } catch (error) {
      console.error(error);
      throwError(400, 'Some error occurred.');
    }
  },
);

export const getVerifiedObject: RequestHandler<any> = asyncWrap(
  async (_req, res, _next) => {
    try {
      const objectKey = _req.body.fileKey;
      const bucket = `${process.env.AWS_BUCKET_NAME_VERIFIED}`;
      const readStream = getFileStream(objectKey, bucket);
      res.attachment('sheet.xlsx');
      readStream.pipe(res);
    } catch (error) {
      console.error(error);
      throwError(400, 'Some error occurred.');
    }
  },
);
