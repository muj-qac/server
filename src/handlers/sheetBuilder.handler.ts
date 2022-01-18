import { sheetsAPI, driveAPI } from '../config/google.config';
import { SERVICE_ACCOUNT_EMAIL, ADMIN_ACCOUNT_EMAIL } from '../constants/sheet';
import { validateSheet } from './sheetValidator.handler';
import { CellValidation } from '../types/sheet/validations';
import { throwError } from '../helpers/ErrorHandler.helper';

export const buildSheet = async (columns: CellValidation[]) => {
  let response = { success: true, data: {}, error: null };
  try {
    // create a new sheet
    let properties = { title: 'Test KPI' };

    const newSheet = await sheetsAPI.spreadsheets.create({
      requestBody: { sheets: [{ properties }] },
    });

    if (!newSheet.data.spreadsheetId) {
      throwError(500, 'Error creating spreadsheet sheet');
      return;
    }
    if (!newSheet.data.sheets) {
      throwError(500, 'Error creating sheet');
      return;
    }

    const sheetLink = newSheet.data.spreadsheetUrl;
    const spreadsheetId = newSheet.data.spreadsheetId;
    const sheetId = newSheet.data.sheets[0].properties?.sheetId;

    // let newSheet = { data: { sheets: true } };
    // const spreadsheetId = '1E0bxQjtTA4UyIH8pQ8f7jsmJB728sxKeWMJp7aH6JlQ';
    // // const sheetId = 1405141948;
    // const sheetId = 1590282294;

    // grant editor permissions to the Drive account
    let editorPermissions = {
      fileId: `${spreadsheetId}`,
      requestBody: {
        role: 'writer',
        emailAddress: ADMIN_ACCOUNT_EMAIL,
        type: 'user',
      },
    };
    await driveAPI.permissions.create(editorPermissions);

    // write the header fields to the sheet
    let totalCols = columns.length;
    let headerValues = columns.map((column) => ({
      userEnteredValue: {
        stringValue: column.name,
      },
    }));

    // add columns
    await sheetsAPI.spreadsheets.batchUpdate({
      spreadsheetId: `${spreadsheetId}`,
      requestBody: {
        requests: newSheet.data.sheets
          ? [
              {
                updateCells: {
                  fields: '*',
                  range: {
                    sheetId,
                    startRowIndex: 0,
                    startColumnIndex: 0,
                  },
                  rows: [{ values: headerValues }],
                },
              },
              {
                addProtectedRange: {
                  protectedRange: {
                    requestingUserCanEdit: false,
                    description: 'Do not edit header values.',
                    warningOnly: false,
                    editors: {
                      users: [SERVICE_ACCOUNT_EMAIL],
                    },
                    range: {
                      sheetId,
                      startColumnIndex: 0,
                      endColumnIndex: totalCols,
                      startRowIndex: 0,
                      endRowIndex: 1,
                    },
                  },
                },
              },
            ]
          : [],
      },
    });

    // @ts-ignore
    await sheetsAPI.spreadsheets.batchUpdate({
      spreadsheetId: `${spreadsheetId}`,
      requestBody: {
        requests: newSheet.data.sheets
          ? [
              // header validations
              ...columns.map((column, i) => ({
                setDataValidation: {
                  range: {
                    sheetId,
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: i,
                    endColumnIndex: i + 1,
                  },
                  rule: {
                    strict: true,
                    condition: {
                      type: 'ONE_OF_LIST',
                      values: [{ userEnteredValue: column.name }],
                    },
                  },
                },
              })),

              // create data validations
              // ...columns
              //   .filter((column) => column.rule)
              //   .map((validation: CellValidation, i: number) => ({
              //     setDataValidation: {
              //       range: {
              //         sheetId,
              //         startRowIndex: 1,
              //         startColumnIndex: i,
              //         endColumnIndex: i + 1,
              //       },
              //       rule: validateSheet(validation, i),
              //     },
              //   })),

              // create data validations
              ...columns.map((validation: CellValidation, i: number) =>
                validation.rule
                  ? {
                      setDataValidation: {
                        range: {
                          sheetId,
                          startRowIndex: 1,
                          startColumnIndex: i,
                          endColumnIndex: i + 1,
                        },
                        rule: validateSheet(validation, i),
                      },
                    }
                  : null,
              ),
            ]
          : [],
      },
    });

    response.data = { sheetLink };
  } catch (error) {
    console.log(error);
    response.success = false;
    response.error = error;
  } finally {
    return response;
  }
};
