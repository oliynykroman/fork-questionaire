import {Pipe, PipeTransform} from '@angular/core';
import {TopicInterface} from '../types/topic/topic.interface';
import {NavStatusEnum} from '../enums/nav.status.enum';

@Pipe({
  name: 'uncompletedTopics'
})
export class UncompletedTopicsPipe implements PipeTransform {

  transform(topics:TopicInterface[]): boolean {
    return topics.some(topic => topic.status !== NavStatusEnum.COMPLETE);
  }

}
