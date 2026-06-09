import {EventTopicTypeEnum} from '../../enums/event-topic-type.enum';
import {TopicQuestionInterface} from './topic-question.interface';
import {NavStatusEnum} from '../../enums/nav.status.enum';

export interface TopicInterface {
  id: number;
  name: string;
  type: EventTopicTypeEnum;
  order: number;
  status: NavStatusEnum,
  isCurrent: boolean,
  questionTitle?: string,
  questionText?: string,
  questions: TopicQuestionInterface[]
}
