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
import { RejectedKpi } from '../models/RejectedKpi.model';

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

const rejectedBucketParams = {
  Bucket: `${process.env.AWS_BUCKET_NAME_REJECTED}`,
};

const getFileStream = (key, bucket) => {
  const fileParams = {
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
      const aws_key = req.awsKey;
      const status = statusTypes.INPROCESS;
      const user = await User.findOne({ where: { id: userId } });
      const kpiData = await KpiData.findOne({ where: { id: kpi_id } });
      if (!kpiData) throwError(404, 'KPI not found');
      const allocated = await KpiAllocation.findOne({ where: { kpiData } });
      if (!allocated || allocated.status === false)
        throwError(401, 'KPI not allocated');
      const uploadedSheetData = await UploadedSheet.findOne({
        where: { user, allocated, status: statusTypes.PENDING },
      });
      if (uploadedSheetData) {
        const update = await UploadedSheet.update(
          { id: uploadedSheetData.id },
          { status: statusTypes.INPROCESS, aws_key },
        );
        res.status(200).json({
          msg: 'Successfully uploaded ' + req.file?.originalname + ' files!',
          data: req.file,
          update,
        });
      } else {
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
      }
    } catch (error) {
      console.error(error);
      throwError(400, error);
    }
  },
);

export const getUnverifiedKPIs: RequestHandler<any> = asyncWrap(
  async (_req, res, _next) => {
    try {
      // const unverified_kpis = await UploadedSheet.find({
      //   where: { status: statusTypes.INPROCESS },
      // });

      const unverifiedKpis = await UploadedSheet.createQueryBuilder(
        'uploaded_sheets',
      )
        .leftJoinAndSelect('uploaded_sheets.user', 'user_id')
        .where({ status: statusTypes.INPROCESS })
        .execute();

      s3.listObjects(bucketParams, function (err, data) {
        if (err) {
          res.status(404).json({ Error: err });
        } else {
          res.status(200).json({
            unverifiedKpis: data.Contents,
            dbUnverified: unverifiedKpis,
          });
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
      const objectKey = _req.params.fileKey;
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

const addingSheetToRejectedTable = async (uploadedSheetKey, comment, aws_key) => {
  const rejectedKpi = await UploadedSheet.findOne({ aws_key: uploadedSheetKey });
  await UploadedSheet.update({ id: rejectedKpi!.id }, { status: statusTypes.REJECTED });
  const rejectedData = await RejectedKpi.create({ comment, aws_key, uploadedSheet: rejectedKpi }).save();
  return rejectedData;
}
export const rejectKPI: RequestHandler<any> = asyncWrap(
  async (_req, res, _next) => {
    try {
      const uploadedSheetkey = _req.body.fileKey;
      const aws_key = _req.awsKey;
      const comment = _req.body.comment;
      if (!comment || !aws_key) throwError(400, 'Comment and File both are required');
      const rejectedKpi = await addingSheetToRejectedTable(uploadedSheetkey, comment, aws_key);
      // console.log(rejectedKpi);
      const kpiParamsToReject = {
        Bucket: `${process.env.AWS_BUCKET_NAME_REJECTED}`,
        CopySource: `/${process.env.AWS_BUCKET_NAME}/${uploadedSheetkey}`,
        Key: uploadedSheetkey,
      };
      const kpiParams = {
        Bucket: `${process.env.AWS_BUCKET_NAME}`,
        Key: uploadedSheetkey,
      };
      s3.copyObject(kpiParamsToReject, function (err, data) {
        if (err) res.status(400).json({ err });
        else res.status(200).json({ rejectedKpi, data });
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
      const statusToVerify = await UploadedSheet.update(
        { aws_key: key },
        { status: statusTypes.VERIFIED },
      );
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
        else res.status(200).json({ data, statusToVerify });
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
      const file1 = s3.getObject(Verifiedparams).createReadStream();
      const buffersVerified: any[] = [];

      const file2 = s3.getObject(Unverifiedparams).createReadStream();
      const buffersUnverified: any[] = [];

      let verifiedSheetJson: any[] = [];
      let unverifiedSheetJson: any[] = [];

      // let verifiedSheetJson: any[] = [];
      const readFile1 = new Promise((res, _rej) => {
        file1.on('data', function (data) {
          buffersVerified.push(data);
        });
        file1.on('end', function () {
          const bufferVerified = Buffer.concat(buffersVerified);
          const verifiedSheetData = xlsx.read(bufferVerified);
          const verifiedSheetCsv = xlsx.utils.sheet_to_json(
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
          const bufferUnverified = Buffer.concat(buffersUnverified);
          const unverifiedSheetData = xlsx.read(bufferUnverified);
          const unverifiedSheetCsv = xlsx.utils.sheet_to_json(
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
      const filename = 'mainKpi/kpi.xlsx';
      const wb_opts: any = { bookType: 'xlsx', type: 'binary' }; // workbook options
      xlsx.writeFile(wb, filename, wb_opts); // write workbook file

      const stream = fs.createReadStream(filename); // create read stream
      // let filePath = __dirname + '/mainKpi/kpi.xlsx'
      // const file = fs.readFileSync(filePath);
      // fs.readFile(filePath,(err,data) => {
      //   let s3Bucket =
      // })

      res.attachment('mainKpi.xlsx');
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
      const verifiedKpis = await UploadedSheet.createQueryBuilder(
        'uploaded_sheets',
      )
        .leftJoinAndSelect('uploaded_sheets.user', 'user_id')
        .where({ status: statusTypes.VERIFIED })
        .execute();

      s3.listObjects(verifiedBucketParams, function (err, data) {
        if (err) {
          res.status(404).json({ Error: err });
        } else {
          res.status(200).json({
            verifiedKpis: data.Contents,
            dbVerified: verifiedKpis,
          });
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
      const rejectedKpis = await UploadedSheet.find({
        where: { status: statusTypes.PENDING },
      });
      s3.listObjects(rejectedBucketParams, function (err, data) {
        if (err) {
          res.status(404).json({ Error: err });
        } else {
          res
            .status(200)
            .json({ rejectedKpis: data.Contents, dbRejected: rejectedKpis });
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

export const getRejectedObject: RequestHandler<any> = asyncWrap(
  async (_req, res, _next) => {
    try {
      const objectKey = _req.params.fileKey;
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
