import { driveAPI } from '../config/google.config';

export const downloadGoogleSheet = async (fileId: string) => {
  try {
    const file = await driveAPI.files.export(
      {
        fileId,
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      { responseType: 'stream' },
    );
    return file;
  } catch (error) {
    console.log(error);
    return null;
  }
};
