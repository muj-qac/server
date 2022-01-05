import express, { Application, Request, Response } from 'express';
import { ErrorHandler } from './helpers/ErrorHandler.helper';
import * as dotenv from 'dotenv';
import api from './routes';
import db from './db/database';

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 3000;
db();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', api);

app.use(ErrorHandler);

app.get('/', (_: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`App listening at: ${PORT}`);
});
