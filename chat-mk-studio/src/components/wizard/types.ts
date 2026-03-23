export interface WizardOption {
  value: string;
  label: string;
  description?: string;
}

export type InputType = "radio" | "checkbox" | "text" | "textarea" | "select";

export interface WizardQuestion {
  id: string;
  group: string;
  question: string | ((answers: WizardAnswers) => string);
  subtitle?: string | ((answers: WizardAnswers) => string);
  type: InputType;
  options?: WizardOption[];
  placeholder?: string | ((answers: WizardAnswers) => string);
  required: boolean;
  showWhen?: (answers: WizardAnswers) => boolean;
  defaultValue?: (answers: WizardAnswers) => string;
}

export type WizardAnswers = Record<string, string | string[]>;
