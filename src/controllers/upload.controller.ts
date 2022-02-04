import dotenv from 'dotenv';
dotenv.config();
import { RequestHandler } from 'express';
import { throwError } from '../helpers/ErrorHandler.helper';
import { asyncWrap } from '../middlewares/async.middleware';
import { statusTypes, UploadedSheet } from '../models/UploadedSheet.model';
import aws from 'aws-sdk';
import xlsx from 'xlsx';
import fs from 'fs';
import { User } from '../models/User.model';
import { KpiAllocation } from '../models/KpiAllocation.model';
import { KpiData } from '../models/KpiData.model';

const s3 = new aws.S3({
  accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
  secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
  signatureVersion: 'v4',
});

const bucketParams = {
  Bucket: `${process.env.AWS_BUCKET_NAME}`,
};

const verifiedBucketParams = {
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
      //TODO: solve error
      const requestUser: any = req.user;
      const userId = requestUser.id;
      const kpi_id = req.params.kpiId;
      const aws_key = "bleh";
      const status = statusTypes.INPROCESS;
      const user = await User.findOne({ where: { id: userId } });
      const kpiData = await KpiData.findOne({ where: { id: kpi_id } });
      if (!kpiData) throwError(404, "KPI not found");
      const allocated = await KpiAllocation.findOne({ where: { kpiData } });
      if (!allocated || allocated.status === false) throwError(401, 'KPI not allocated');
      const uploadedSheet = UploadedSheet.create({
        status,
        aws_key,
        allocated,
        user,
      });
      await uploadedSheet.save();
      res.status(200).json({
        msg: 'Successfully uploaded ' + req.file?.originalname + ' files!',
        data: req.file,
        uploadedSheet: uploadedSheet,
      });
    } catch (error) {
      console.error(error);
      throwError(400, error);
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
  async (req, res, _next) => {
    try {
      const keyVerified = req.body.fileKeyVerified;
      const keyUnverified = req.body.fileKeyUnverified;
      const bucketUnverified = `${process.env.AWS_BUCKET_NAME_VERIFIED}`;
      const bucket = `${process.env.AWS_BUCKET_NAME_VERIFIED}`;
      const Verifiedparams = {
        Bucket: bucket,
        Key: keyVerified,
      };
      const Unverifiedparams = {
        Bucket: bucketUnverified,
        Key: keyUnverified,
      };
      let file1 = s3.getObject(Verifiedparams).createReadStream();
      let buffersVerified: any[] = [];

      let file2 = s3.getObject(Unverifiedparams).createReadStream();
      let buffersUnverified: any[] = [];

      let verifiedSheetJson: any[] = [];
      let unverifiedSheetJson: any[] = [];

      // let verifiedSheetJson: any[] = [];
      const readFile1 = new Promise((res, _rej) => {
        file1.on('data', function (data) {
          buffersVerified.push(data);
        });
        file1.on('end', function () {
          let bufferVerified = Buffer.concat(buffersVerified);
          let verifiedSheetData = xlsx.read(bufferVerified);
          let verifiedSheetCsv = xlsx.utils.sheet_to_json(
            verifiedSheetData.Sheets[verifiedSheetData.SheetNames[0]],
          );
          // console.log(verifiedSheetCsv);
          verifiedSheetJson = verifiedSheetCsv;
          res('s');
        });
      });
      // console.log(verifiedSheetCsv);

      const readFile2 = new Promise((res, _rej) => {
        file2.on('data', function (data) {
          buffersUnverified.push(data);
        });
        file2.on('end', function () {
          let bufferUnverified = Buffer.concat(buffersUnverified);
          let unverifiedSheetData = xlsx.read(bufferUnverified);
          let unverifiedSheetCsv = xlsx.utils.sheet_to_json(
            unverifiedSheetData.Sheets[unverifiedSheetData.SheetNames[0]],
          );
          // console.log(unverifiedSheetCsv);
          unverifiedSheetJson = unverifiedSheetCsv;
          res('s');
        });
      });

      const readFiles = Promise.all([readFile1, readFile2]);
      const result = await readFiles;

      let combinedData: any[] = [];
      combinedData = [...verifiedSheetJson, ...unverifiedSheetJson];
      const combinedSheet = xlsx.utils.json_to_sheet(combinedData);
      const wb: xlsx.WorkBook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, combinedSheet, 'test');
      const filename = 'users.xlsx';
      const wb_opts: any = { bookType: 'xlsx', type: 'binary' }; // workbook options
      xlsx.writeFile(wb, filename, wb_opts); // write workbook file

      const stream = fs.createReadStream(filename); // create read stream
      stream.pipe(res);
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
