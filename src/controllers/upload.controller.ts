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
import { VerifiedKpi } from '../models/VerifiedKpi.model';

const s3 = new aws.S3({
  accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
  secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
  signatureVersion: 'v4',
});

const bucketParams = {
  Bucket: `${process.env.AWS_BUCKET_NAME}`,
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
        where: { user, allocated, status: statusTypes.REJECTED },
      });
      console.log(uploadedSheetData);
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
      throwError(400, error);
    }
  },
);

export const downloadUnverifiedObject: RequestHandler<any> = asyncWrap(
  async (req, res, _next) => {
    try {
      const { objectKey } = req.params;
      const objectKeyDecoded = Buffer.from(objectKey, 'base64').toString();
      const bucket = `${process.env.AWS_BUCKET_NAME}`;
      const readStream = getFileStream(objectKeyDecoded, bucket);
      readStream.on('error', () => {
        res.status(404).send('File not found');
      });
      res.attachment(`${objectKeyDecoded}`);
      readStream.pipe(res);
    } catch (error) {
      console.error(error);
      throwError(400, error);
    }
  },
);

const addingSheetToRejectedTable = async (
  uploadedSheetKey,
  comment,
  aws_key,
) => {
  const rejectedKpi = await UploadedSheet.findOne({
    aws_key: uploadedSheetKey,
  });
  await UploadedSheet.update(
    { id: rejectedKpi!.id },
    { status: statusTypes.REJECTED },
  );
  const rejectedData = await RejectedKpi.create({
    comment,
    aws_key,
    uploadedSheet: rejectedKpi,
  }).save();
  return rejectedData;
};
export const rejectKPI: RequestHandler<any> = asyncWrap(
  async (_req, res, _next) => {
    try {
      const uploadedSheetkey = _req.body.fileKey;
      const aws_key = _req.awsKey;
      const comment = _req.body.comment;
      if (!comment || !aws_key)
        throwError(400, 'Comment and File both are required');
      const rejectedKpi = await addingSheetToRejectedTable(
        uploadedSheetkey,
        comment,
        aws_key,
      );
      if (!rejectedKpi) throwError(500, 'No Entry in Database');
      res.status(200).json(rejectedKpi);
    } catch (error) {
      console.log(error);
      throwError(400, error);
    }
  },
);

export const verifyKPI: RequestHandler<any> = asyncWrap(
  async (req, res, _next) => {
    try {
      const key = req.body.fileKey;
      const statusToVerify = await UploadedSheet.update(
        { aws_key: key },
        { status: statusTypes.VERIFIED },
      );
      if (!statusToVerify) throwError(500, 'No Entry in Database');
      const verfiedUploadedKpi = await UploadedSheet.findOne({ aws_key: key });
      const verfiedKpi = await VerifiedKpi.create({
        aws_key: key,
        uploadedSheet: verfiedUploadedKpi,
      }).save();
      res.status(200).json(verfiedKpi);
    } catch (error) {
      console.error(error);
      throwError(400, error);
    }
  },
);

//! ++++++++++++++++++++++++++++ CAUTION ++++++++++++++++++++++++++++
export const updateMainKPI: RequestHandler<any> = asyncWrap(
  async (req, res, _next) => {
    try {
      const masterFileKey = req.body.masterFileKey;
      const appendFileKey: string = req.body.fileKey;
      const kpiId = req.params.kpiId;
      const bucketCommon = `${process.env.AWS_BUCKET_NAME}`;
      const bucketMaster = `${process.env.AWS_BUCKET_NAME_MASTER}`;

      const masterParams = {
        Bucket: bucketMaster,
        Key: masterFileKey,
      };
      const commonParams = {
        Bucket: bucketCommon,
        Key: appendFileKey,
      };

      s3.headObject(masterParams, async function (err) {
        if (err && err.name === 'NotFound') {
          const appendFile = s3.getObject(commonParams).createReadStream();
          const appendBuffer: any[] = [];
          let appendJson: any[] = [];

          const readAppend = new Promise((res, _rej) => {
            try {
              appendFile.on('data', function (data) {
                appendBuffer.push(data);
              });
              appendFile.on('end', function () {
                const bufferAppend = Buffer.concat(appendBuffer);
                const appendData = xlsx.read(bufferAppend);
                const appendCsv = xlsx.utils.sheet_to_json(
                  appendData.Sheets[appendData.SheetNames[0]],
                );
                appendJson = appendCsv;
                res('s');
              });
            } catch (error) {
              throwError(400, error);
            }
          });

          await Promise.all([readAppend]);

          // combine both files
          let combinedData: any[] = [];
          combinedData = [...appendJson];
          const combinedSheet = xlsx.utils.json_to_sheet(combinedData);
          const wb: xlsx.WorkBook = xlsx.utils.book_new();
          xlsx.utils.book_append_sheet(wb, combinedSheet, 'Merged Sheet');
          const filename = 'merged-kpi.xlsx';
          const wb_opts: any = { bookType: 'xlsx', type: 'binary' }; // workbook options
          xlsx.writeFile(wb, filename, wb_opts); // write workbook file

          const merged_filename = `${kpiId}.xlsx`;
          fs.readFile(filename, (err, data) => {
            if (err) throw err;
            const params = {
              Bucket: `${process.env.AWS_BUCKET_NAME_MASTER}`,
              Key: `merged/${merged_filename}`,
              Body: data,
            };
            s3.upload(params, function (err) {
              if (err) {
                console.log(`Error uploading data in ${params.Key}`, err);
              } else console.log(`File uploaded with key ${params.Key}`);
            });
          });

          res.status(200).json({ message: 'success' });
        } else {
          const masterFile = s3.getObject(masterParams).createReadStream();
          const masterBuffer: any[] = [];

          const appendFile = s3.getObject(commonParams).createReadStream();
          const appendBuffer: any[] = [];

          let masterJson: any[] = [];
          let appendJson: any[] = [];

          const readMaster = new Promise((res, _rej) => {
            try {
              masterFile.on('data', function (data) {
                masterBuffer.push(data);
              });
              masterFile.on('end', function () {
                const bufferMaster = Buffer.concat(masterBuffer);
                const masterData = xlsx.read(bufferMaster);
                const masterCsv = xlsx.utils.sheet_to_json(
                  masterData.Sheets[masterData.SheetNames[0]],
                );
                masterJson = masterCsv;
                res('s');
              });
            } catch (error) {
              throwError(400, error);
            }
          });

          const readAppend = new Promise((res, _rej) => {
            try {
              appendFile.on('data', function (data) {
                appendBuffer.push(data);
              });
              appendFile.on('end', function () {
                const bufferAppend = Buffer.concat(appendBuffer);
                const appendData = xlsx.read(bufferAppend);
                const appendCsv = xlsx.utils.sheet_to_json(
                  appendData.Sheets[appendData.SheetNames[0]],
                );
                appendJson = appendCsv;
                res('s');
              });
            } catch (error) {
              throwError(400, error);
            }
          });

          await Promise.all([readMaster, readAppend]);

          // combine both files
          let combinedData: any[] = [];
          combinedData = [...masterJson, ...appendJson];
          const combinedSheet = xlsx.utils.json_to_sheet(combinedData);
          const wb: xlsx.WorkBook = xlsx.utils.book_new();
          xlsx.utils.book_append_sheet(wb, combinedSheet, 'Merged Sheet');
          const filename = 'merged-kpi.xlsx';
          const wb_opts: any = { bookType: 'xlsx', type: 'binary' }; // workbook options
          xlsx.writeFile(wb, filename, wb_opts); // write workbook file

          const merged_filename = `${kpiId}.xlsx`;
          fs.readFile(filename, (err, data) => {
            if (err) throw err;
            const params = {
              Bucket: `${process.env.AWS_BUCKET_NAME_MASTER}`,
              Key: `merged/${merged_filename}`,
              Body: data,
            };
            s3.upload(params, function (err) {
              if (err) {
                console.log(`Error uploading data in ${params.Key}`, err);
              } else console.log(`File uploaded with key ${params.Key}`);
            });
          });
          const updatedToMerged = await UploadedSheet.update(
            { aws_key: appendFileKey },
            { status: statusTypes.MERGED },
          );
          res.status(200).json({ message: 'success', updatedToMerged });
        }
      });
    } catch (error) {
      console.log('Error ============: ', error);
      throwError(400, error);
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

      if (!verifiedKpis) throwError(500, 'No Entry in Database');
      res.status(200).json(verifiedKpis);
    } catch (error) {
      console.error(error);
      throwError(400, error);
    }
  },
);

export const getRejectedKPIs: RequestHandler<any> = asyncWrap(
  async (_req, res, _next) => {
    try {
      const rejectedKpis = await UploadedSheet.find({
        where: { status: statusTypes.REJECTED },
      });
      if (!rejectedKpis) throwError(500, 'No Entry in Database');
      res.status(200).json(rejectedKpis);
    } catch (error) {
      console.error(error);
      throwError(400, error);
    }
  },
);

export const downloadVerifiedObject: RequestHandler<any> = asyncWrap(
  async (req, res, _next) => {
    try {
      const { objectKey } = req.params;
      const objectKeyDecoded = Buffer.from(objectKey, 'base64').toString();
      const bucket = `${process.env.AWS_BUCKET_NAME}`;
      const readStream = getFileStream(objectKeyDecoded, bucket);
      readStream.on('error', () => {
        res.status(404).send('File not found');
      });
      res.attachment(`${objectKeyDecoded}`);
      readStream.pipe(res);
    } catch (error) {
      console.error(error);
      throwError(400, error);
    }
  },
);

export const getRejectedObject: RequestHandler<any> = asyncWrap(
  async (_req, res, _next) => {
    try {
      const objectKey = _req.params.fileKey;
      const objectKeyDecoded = Buffer.from(objectKey, 'base64').toString();
      const bucket = `${process.env.AWS_BUCKET_NAME}`;
      const readStream = getFileStream(objectKeyDecoded, bucket);
      readStream.on('error', () => {
        res.status(404).send('File not found');
      });
      res.attachment(`${objectKey}`);
      readStream.pipe(res);
    } catch (error) {
      console.error(error);
      throwError(400, error);
    }
  },
);

export const downloadRejectedKPIsForUsers: RequestHandler<any> = asyncWrap(
  async (req, res) => {
    try {
      const objectKey = req.params.fileKey;
      const objectKeyDecoded = Buffer.from(objectKey, 'base64').toString();
      const bucket = `${process.env.AWS_BUCKET_NAME}`;
      const readStream = getFileStream(objectKeyDecoded, bucket);
      readStream.on('error', () => {
        res.status(404).send('File not found');
      });
      res.attachment(`${objectKey}`);
      readStream.pipe(res);
    } catch (error) {
      console.error(error);
      throwError(400, error);
    }
  },
);

export const downloadMergedKPI: RequestHandler<any> = asyncWrap(
  async (req, res) => {
    try {
      const objectKey = `merged/${req.params.fileKey}.xlsx`;
      const bucket = `${process.env.AWS_BUCKET_NAME_MASTER}`;
      const readStream = getFileStream(objectKey, bucket);
      readStream.on('error', () => {
        res.status(404).send('File not found');
      });
      res.attachment(`${objectKey}`);
      readStream.pipe(res);
    } catch (error) {
      throwError(400, error.message);
    }
  },
);
