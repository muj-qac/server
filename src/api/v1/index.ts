import express from 'express';
import builder from './builder';

const api = express();
api.use(express.json());
api.use(express.urlencoded({ extended: true }));

api.use('/builder', builder);

export default api;
