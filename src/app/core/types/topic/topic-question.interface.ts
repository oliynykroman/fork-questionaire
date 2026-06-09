import {FormControlInterface} from '../form/form-control.interface';
import {EventTopicStepTypeEnum} from '../../enums/event-topic-step-type.enum';
import {TopicMediaInterface} from './topic-media.interface';
import {ConditionFieldTypeEnum} from '../../enums/condition-field-type.enum';

export interface TopicQuestionInterface {
  id: number;
  questionId: number;
  questionType: EventTopicStepTypeEnum;
  formulaKey: string;
  media: TopicMediaInterface;
  title?: string;
  text?: string;
  impact?: number;
  isCurrent?: boolean;
  conditionFieldName?: string;
  conditionFieldValue?: string | number | boolean;
  totalSum?: number;
  controls?: FormControlInterface[];
  isSingleCheckbox?: boolean;
  defaultValueFormulaKey: string;
  conditionFieldType?: ConditionFieldTypeEnum;
  isSkipped?: boolean;
  isOptional?: boolean;
  isValid?: boolean;
  recalculateButton: string;
}
