import dotenv from 'dotenv';
dotenv.config();
import aws from 'aws-sdk';
import { Request } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { KpiData } from '../models/KpiData.model';
import { throwError } from '../helpers/ErrorHandler.helper';

const s3 = new aws.S3({
  accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
  secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
  signatureVersion: 'v4',
});

const getKpiName = async (kpiId) => {
  const kpiData = await KpiData.findOne({ where: { id: kpiId } });
  if (!kpiData) throwError(404, 'Kpi not found');
  return kpiData!.name;
};

export const uploadMiddleware = multer({
  storage: multerS3({
    s3: s3,
    bucket: `${process.env.AWS_BUCKET_NAME}`,
    metadata: function (_req: Request, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: async (_req: Request, file, cb) => {
      const kpiName = await getKpiName(_req.params.kpiId);
      const key =
        kpiName + '/' + Date.now().toString() + '-' + file.originalname;
      _req.awsKey = key;
      cb(null, key);
    },
  }),
});

