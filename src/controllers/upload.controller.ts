import dotenv from 'dotenv';
dotenv.config();
import { RequestHandler } from 'express';
import { throwError } from '../helpers/ErrorHandler.helper';
import { asyncWrap } from '../middlewares/async.middleware';
// import { statusTypes, UploadedSheet } from '../models/UploadedSheet.model';
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

let rejectedBucketParams = {
  Bucket: `${process.env.AWS_BUCKET_NAME_REJECTED}`,
};

const getFileStream = (key, bucket) => {
  let fileParams = {
    Key: key,
    Bucket: bucket,
  };
  return s3.getObject(fileParams).createReadStream();
};

export const postKPI: RequestHandler<any> = asyncWrap(
  async (req, res, _next) => {
    try {
      res.status(200).json({
        msg: 'Successfully uploaded ' + req.file?.originalname + ' files!',
        data: req.file,
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
          res.status(200).json({ 'Unverified kpis': data.Contents });
        }
      });
    } catch (error) {
      console.error(error);
      throwError(400, 'Some error occurred.');
    }
  },
);

export const getUnverifiedObject: RequestHandler<any> = asyncWrap(
  async (_req, res, _next) => {
    try {
      const objectKey = _req.body.fileKey;
      const bucket = `${process.env.AWS_BUCKET_NAME}`;
      const readStream = getFileStream(objectKey, bucket);
      res.attachment(`${objectKey}.xlsx`);
      readStream.pipe(res);
    } catch (error) {
      console.error(error);
      throwError(400, 'Some error occurred.');
    }
  },
);

export const rejectKPI: RequestHandler<any> = asyncWrap(
  async (_req, res, _next) => {
    try {
      const key = _req.body.fileKey;
      const kpiParamsToReject = {
        Bucket: `${process.env.AWS_BUCKET_NAME_REJECTED}`,
        CopySource: `/${process.env.AWS_BUCKET_NAME}/${key}`,
        Key: key,
      };
      const kpiParams = {
        Bucket: `${process.env.AWS_BUCKET_NAME}`,
        Key: key,
      };
      s3.copyObject(kpiParamsToReject, function (err, data) {
        if (err) res.status(400).json({ err });
        else res.status(200).json({ data });
      });
      s3.deleteObject(kpiParams, function (err, data) {
        if (err) console.log({ err });
        else console.log({ data });
      });
    } catch (error) {
      console.log(error);
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
  async (_req, _res, _next) => {
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
          verifiedSheetData.Sheets[verifiedSheetData.SheetNames[0]],
        );
        const verifiedSheetJsonToSheet: any =
          xlsx.utils.json_to_sheet(verifiedSheetJson);
        console.log(verifiedSheetJsonToSheet);
        const modifiedWorkbook = xlsx.utils.book_new();
        let sheet = xlsx.utils.book_append_sheet(
          verifiedSheetJsonToSheet,
          modifiedWorkbook,
          'kpiName',
        );
        _res.send(sheet);
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
          res.status(200).json({ 'Verified kpis': data.Contents });
        }
      });
    } catch (error) {
      console.error(error);
      throwError(400, 'Some error occurred.');
    }
  },
);

export const getRejectedKPIs: RequestHandler<any> = asyncWrap(
  async (_req, res, _next) => {
    try {
      s3.listObjects(rejectedBucketParams, function (err, data) {
        if (err) {
          res.status(404).json({ Error: err });
        } else {
          res.status(200).json({ 'Rejected kpis': data.Contents });
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
      res.attachment(`${objectKey}.xlsx`);
      readStream.pipe(res);
    } catch (error) {
      console.error(error);
      throwError(400, 'Some error occurred.');
    }
  },
);

export const getRejectedObject: RequestHandler<any> = asyncWrap(
  async (_req, res, _next) => {
    try {
      const objectKey = _req.body.fileKey;
      const bucket = `${process.env.AWS_BUCKET_NAME_REJECTED}`;
      const readStream = getFileStream(objectKey, bucket);
      res.attachment(`${objectKey}.xlsx`);
      readStream.pipe(res);
    } catch (error) {
      console.error(error);
      throwError(400, 'Some error occurred.');
    }
  },
);
