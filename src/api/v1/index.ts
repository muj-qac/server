import express from 'express';
import builderRoute from './Routes/builder';
import authRoute from "./Routes/auth";

const api = express();
api.use(express.json());
api.use(express.urlencoded({ extended: true }));

api.use('/builder', builderRoute);
api.use('/auth',authRoute);

export default api;
