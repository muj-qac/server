export interface TextRule {
  equals?: string;
  notContains?: string;
  contains?: string;
  isValidEmail?: boolean;
  isValidURL?: boolean;
}

export interface NumberRule {
  equals?: number;
  between?: { from: number; to: number };
  lessThan?: { number: number; equal: boolean };
  greaterThan?: { number: number; equal: boolean };
}

export interface DateRule {
  isValid?: boolean;
  between?: { from: string; to: string };
  lessThan?: { date: string; equal: boolean };
  greaterThan?: { date: string; equal: boolean };
}

export interface DropdownRule {
  list: string[];
}

export interface CheckboxRule {
  useCustom?: boolean;
  customValues?: { true: string; false: string };
}

export interface CellValidation {
  name: string;
  type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox';
  invalidAction: 'warn' | 'reject';
  rule?: TextRule | NumberRule | DateRule | DropdownRule | CheckboxRule;
  invalidHelpText?: string;
}
