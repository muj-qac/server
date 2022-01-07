import { auth as sheetsAuth, sheets } from '@googleapis/sheets';
import { auth as driveAuth, drive } from '@googleapis/drive';
import path from 'path';

export const sheetsAPI = sheets({
  version: 'v4',
  auth: new sheetsAuth.GoogleAuth({
    keyFile: path.join(__dirname, '/googleKey.json'),
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://docs.google.com/feeds',
      'https://spreadsheets.google.com/feeds',
    ],
  }),
});

export const driveAPI = drive({
  version: 'v3',
  auth: new driveAuth.GoogleAuth({
    keyFile: path.join(__dirname, '/googleKey.json'),
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://docs.google.com/feeds',
      'https://spreadsheets.google.com/feeds',
    ],
  }),
});
