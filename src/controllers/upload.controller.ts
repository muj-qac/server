import dotenv from 'dotenv';
dotenv.config();
import { RequestHandler } from 'express';
import { throwError } from '../helpers/ErrorHandler.helper';
import { asyncWrap } from '../middlewares/async.middleware';
import aws from 'aws-sdk';

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

const getFileStream = (key) => {
  let fileParams = {
    Key: key,
    Bucket: `${process.env.AWS_BUCKET_NAME}`,
  };
  return s3.getObject(fileParams).createReadStream();
};

export const getObject: RequestHandler<any> = asyncWrap(
  async (_req, res, _next) => {
    try {
      const objectKey = _req.body.fileKey;
      const readStream = getFileStream(objectKey);
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
      const kpiParams = {
        Bucket: `${process.env.AWS_BUCKET_NAME_VERIFIED}`,
        CopySource: '/' + `${process.env.AWS_BUCKET_NAME}` + '/' + key,
        Key: key,
      };
      s3.copyObject(kpiParams, function (err, data) {
        if (err) res.status(404).json({ err });
        else res.status(200).json({ data });
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
