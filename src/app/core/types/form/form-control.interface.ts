import { FormControlTypeEnum } from '../../enums/form-control-type.enum';

export interface FormControlInterface {
  type: FormControlTypeEnum;
  label: string;
  title: string;
  text: string;
  name: string;
  value: string | number | boolean;
  options?: FormControlOptionsInterface[];
  validations?: FormControlValidationInterface[];
  min?: number | string;
  max?: number | string;
  suffixLabel?: string;
  formulaKey: string;
  isName:boolean;
  isPhisicalDelegates: boolean;
  isDigitalDelegates: boolean;
  defaultValueFormulaKey: string;
  uniqueName?: string;
  triggerSaveEvent?: boolean;
  isManuallyChanged?: boolean;
}

export interface FormControlValidationInterface {
  name: string;
  message: string;
}

export interface FormControlOptionsInterface {
  label: string;
  value: number | string | boolean;
}
