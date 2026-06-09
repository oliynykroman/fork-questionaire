import {EventTopicTypeEnum} from '../../enums/event-topic-type.enum';

export interface EventRouteInterface{
  eventId: number | string;
  eventTopic: EventTopicTypeEnum;
  currentQuestion: number;
}
