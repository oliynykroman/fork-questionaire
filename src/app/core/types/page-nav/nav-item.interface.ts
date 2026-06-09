import {NavStatusEnum} from '../../enums/nav.status.enum';
import {EventTopicTypeEnum} from '../../enums/event-topic-type.enum';

export interface EventNavItemInterface extends NavItemBaseInterface {
  topicType:EventTopicTypeEnum;
  status?: NavStatusEnum;
  isCurrent?: boolean;
}

export interface PageNavItemInterface extends NavItemBaseInterface {
  path?: string;

}

export interface NavItemBaseInterface{
  id: number;
  name?: string;
  order: number;
  title: string;
}
