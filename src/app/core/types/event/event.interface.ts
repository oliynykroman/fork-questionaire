import { EventTypeEnum } from '../../enums/event-type.enum';
import { TopicInterface } from '../topic/topic.interface';

export interface EventInterface {
  id: number;
  name?: string;
  year?: number;
  totalSavedCO2: string;
  type?: EventTypeEnum;
  delegates?: number;
  isPostEventReport?: boolean;
  planningEventId: number;
  postEventId: number;
  accomodationSavedCO2?: string;
  foodAndBeveragesSavedCO2?: string;
  venueSavedCO2?: string;
  topics: TopicInterface[];
  emissionPerDelegatesIndex: number;
  phase: string;
  reportingOrTesting: string;
  bureau: string;
}


