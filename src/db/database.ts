import { createConnection } from 'typeorm';
import { Role } from '../models/Role.model';
import { User } from '../models/User.model';
import { KpiData } from '../models/KpiData.model';
import { KpiAllocation } from '../models/KpiAllocation.model';
import { UploadedSheet } from '../models/UploadedSheet.model';


const db = async (cb) => {
  try {
    await createConnection({
      type: 'postgres',
      url: `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
      extra: {
        ssl: {
          // ca:ssl-certificate, ----------------- This is where we have to attach our ssl certificate and remove unauth section
          require: true,
          rejectUnauthorized: false,
        },
      },
      entities: [User, Role, KpiData, KpiAllocation, UploadedSheet],
      synchronize: true,
    });
    console.log('Connected to Postgres');
    cb();
  } catch (error) {
    console.error(error);
    throw new Error('Unable to connect to db');
  }
};

export default db;
