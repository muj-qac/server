import dotenv from 'dotenv';
dotenv.config();
import aws from 'aws-sdk';
import { Request } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';

const s3 = new aws.S3({
  accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
  secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
  signatureVersion: 'v4',
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: `${process.env.AWS_BUCKET_NAME}`,
    metadata: function (_req: Request, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: (_req: Request, file, cb) => {
      const kpiName = _req.params.kpi;
      cb(null, kpiName + '/' + Date.now().toString() + '-' + file.originalname);
    },
  }),
});

export default upload;
