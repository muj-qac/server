import {
  CellValidation,
  TextRule,
  NumberRule,
  DateRule,
  DropdownRule,
  CheckboxRule,
} from '../types/sheet/validations';

export const textCondition: any = (rule: TextRule, i: number) => {
  if (!rule) return {};
  let cellRange = `${String.fromCharCode(
    Number.parseInt(`${65 + Number.parseInt(`${i}`)}`),
  )}2`;
  let queries = {
    equals: (value: string) => `=EXACT("${value}", ${cellRange})`,
    notContains: (value: string) =>
      `=NOT(ISNUMBER(SEARCH("${value}", ${cellRange})))`,
    contains: (value: string) => `=ISNUMBER(SEARCH("${value}", ${cellRange}))`,
    isValidEmail: (value: boolean) =>
      value ? `=ISNUMBER(MATCH("*@*.*", ${cellRange}, 0))` : ``,
    isValidURL: (value: boolean) =>
      value ? `=ISNUMBER(MATCH("*.*", ${cellRange}, 0))` : ``,
  };
  let type = 'CUSTOM_FORMULA';
  let values = Object.keys(rule).map((query) => ({
    userEnteredValue: `${queries[query](rule[query])}`,
  }));

  return { type, values };
};

export const numberCondition: any = (rule: NumberRule) => {
  if (!rule) return {};
  let queries = {
    equals: () => ({
      type: 'NUMBER_EQ',
      values: [{ userEnteredValue: `${rule.equals}` }],
    }),
    between: () => ({
      type: 'NUMBER_BETWEEN',
      values: [
        { userEnteredValue: `${rule.between?.from}` },
        { userEnteredValue: `${rule.between?.to}` },
      ],
    }),
    lessThan: () => ({
      type: rule.lessThan?.equal ? 'NUMBER_LESS_THAN_EQ' : 'NUMBER_LESS',
      values: [{ userEnteredValue: `${rule.lessThan?.number}` }],
    }),
    greaterThan: () => ({
      type: rule.greaterThan?.equal
        ? 'NUMBER_GREATER_THAN_EQ'
        : 'NUMBER_GREATER',
      values: [{ userEnteredValue: `${rule.greaterThan?.number}` }],
    }),
  };

  return Object.keys(rule).map((query) => queries[query](rule[query]))[0];
};

export const dateCondition: any = (rule: DateRule) => {
  if (!rule) return {};
  let queries = {
    isValid: () => ({ type: 'DATE_IS_VALID' }),
    between: () => ({
      type: 'DATE_BETWEEN',
      values: [
        { userEnteredValue: `${rule.between?.from}` },
        { userEnteredValue: `${rule.between?.to}` },
      ],
    }),
    lessThan: () => ({
      type: rule.lessThan?.equal ? 'DATE_ON_OR_BEFORE' : 'DATE_BEFORE',
      values: [{ userEnteredValue: `${rule.lessThan?.date}` }],
    }),
    greaterThan: () => ({
      type: rule.greaterThan?.equal ? 'DATE_ON_OR_AFTER' : 'DATE_AFTER',
      values: [{ userEnteredValue: `${rule.greaterThan?.date}` }],
    }),
  };

  return Object.keys(rule).map((query) => queries[query](rule[query]))[0];
};

export const dropdownCondition: any = (rule: DropdownRule) => {
  if (!rule) return {};
  let queries = {
    list: () => ({
      type: 'ONE_OF_LIST',
      values: rule.list.map((value) => ({ userEnteredValue: `${value}` })),
    }),
  };

  return Object.keys(rule).map((query) => queries[query](rule[query]))[0];
};

export const checkboxCondition: any = (rule: CheckboxRule) => {
  // TODO: remove useCustom field from validations
  if (!rule) return { type: 'BOOLEAN' };
  let queries = {
    useCustom: () =>
      rule.useCustom
        ? {
            type: 'BOOLEAN',
            values: [
              { userEnteredValue: `${rule.customValues?.true}` },
              { userEnteredValue: `${rule.customValues?.false}` },
            ],
          }
        : { type: 'BOOLEAN' },
    customValues: () =>
      rule.useCustom
        ? {
            type: 'BOOLEAN',
            values: [
              { userEnteredValue: `${rule.customValues?.true}` },
              { userEnteredValue: `${rule.customValues?.false}` },
            ],
          }
        : { type: 'BOOLEAN' },
  };

  return Object.keys(rule).map((query) => queries[query](rule[query]))[0];
};

export const validateSheet = (validation: CellValidation, i: number) => {
  // TODO: check if the code below can be simplified
  switch (validation.type) {
    case 'text':
      return {
        inputMessage: validation.invalidHelpText
          ? validation.invalidHelpText
          : 'No help message.',
        strict: validation.invalidAction === 'reject' ? true : false,
        condition: textCondition(validation.rule as TextRule, i),
      };

    case 'number':
      return {
        inputMessage: validation.invalidHelpText
          ? validation.invalidHelpText
          : 'No help message.',
        strict: validation.invalidAction === 'reject' ? true : false,
        condition: numberCondition(validation.rule as NumberRule),
      };

    case 'date':
      return {
        inputMessage: validation.invalidHelpText
          ? validation.invalidHelpText
          : 'No help message.',
        strict: validation.invalidAction === 'reject' ? true : false,
        condition: dateCondition(validation.rule as DateRule),
      };

    case 'dropdown':
      return {
        inputMessage: validation.invalidHelpText
          ? validation.invalidHelpText
          : 'No help message.',
        strict: validation.invalidAction === 'reject' ? true : false,
        condition: dropdownCondition(validation.rule as DropdownRule),
        showCustomUi: true, // shows dropdown in cell
      };

    case 'checkbox':
      return {
        inputMessage: validation.invalidHelpText
          ? validation.invalidHelpText
          : 'No help message.',
        strict: validation.invalidAction === 'reject' ? true : false,
        condition: checkboxCondition(validation.rule as CheckboxRule),
      };

    default:
      return {};
  }
};
