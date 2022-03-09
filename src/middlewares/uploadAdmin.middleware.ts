import dotenv from 'dotenv';
dotenv.config();
import aws from 'aws-sdk';
import { Request } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { throwError } from '../helpers/ErrorHandler.helper';
import { User } from '../models/User.model';


const s3 = new aws.S3({
    accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
    secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
    signatureVersion: 'v4',
});

const getUserName = async (userId) => {
    const userData = await User.findOne({ where: { id: userId } });
    if (!userData) throwError(404, 'User not found');
    return userData!.first_name;
};


export const uploadMiddlewareAdmin = multer({
    storage: multerS3({
        s3: s3,
        bucket: `${process.env.AWS_BUCKET_NAME}`,
        metadata: function (_req: Request, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: async (_req: Request, file, cb) => {
            const userName = await getUserName(_req.params.userId);
            const key =
                userName + '/' + Date.now().toString() + '-' + file.originalname;
            _req.awsKey = key;
            cb(null, key);
        },
    }),
});

