import { JSONSchemaType } from 'ajv';

import {
  TextRule,
  NumberRule,
  DateRule,
  DropdownRule,
  CheckboxRule,
} from '../types/sheet/validations';

export const isValidTextInput: JSONSchemaType<TextRule> = {
  type: 'object',
  properties: {
    invalidHelpText: { type: 'string', nullable: true },
    equals: { type: 'string', nullable: true },
    notContains: { type: 'string', nullable: true },
    contains: { type: 'string', nullable: true },
    isValidEmail: { type: 'boolean', nullable: true },
    isValidURL: { type: 'boolean', nullable: true },
  },
};

export const isValidNumberInput: JSONSchemaType<NumberRule> = {
  type: 'object',
  properties: {
    equals: { type: 'number', nullable: true },
    between: {
      type: 'object',
      properties: {
        from: { type: 'number', nullable: true },
        to: { type: 'number', nullable: true },
      },
      nullable: true,
      required: ['from', 'to'],
    },
    lessThan: {
      type: 'object',
      properties: {
        number: { type: 'number', nullable: true },
        equal: { type: 'boolean', nullable: true },
      },
      nullable: true,
      required: ['number', 'equal'],
    },
    greaterThan: {
      type: 'object',
      properties: {
        number: { type: 'number', nullable: true },
        equal: { type: 'boolean', nullable: true },
      },
      nullable: true,
      required: ['number', 'equal'],
    },
  },
};

export const isValidDateInput: JSONSchemaType<DateRule> = {
  type: 'object',
  properties: {
    isValid: { type: 'boolean', nullable: true },
    between: {
      type: 'object',
      properties: {
        from: { type: 'string', format: 'date', nullable: true },
        to: { type: 'string', format: 'date', nullable: true },
      },
      nullable: true,
      required: ['from', 'to'],
    },
    lessThan: {
      type: 'object',
      properties: {
        date: { type: 'string', format: 'date', nullable: true },
        equal: { type: 'boolean', nullable: true },
      },
      nullable: true,
      required: ['date', 'equal'],
    },
    greaterThan: {
      type: 'object',
      properties: {
        date: { type: 'string', format: 'date', nullable: true },
        equal: { type: 'boolean', nullable: true },
      },
      nullable: true,
      required: ['date', 'equal'],
    },
  },
};

export const isValidDropdownInput: JSONSchemaType<DropdownRule> = {
  type: 'object',
  properties: {
    list: { type: 'array', items: { type: 'string' } },
  },
  required: ['list'],
};
export const isValidCheckboxInput: JSONSchemaType<CheckboxRule> = {
  type: 'object',
  properties: {
    useCustom: { type: 'boolean', nullable: true },
    customValues: {
      type: 'object',
      properties: { true: { type: 'string' }, false: { type: 'string' } },
      required: ['true', 'false'],
      nullable: true,
    },
  },
};
