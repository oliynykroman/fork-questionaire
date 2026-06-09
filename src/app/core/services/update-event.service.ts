import {inject, Injectable, signal} from '@angular/core';
import {EventService} from './event.service';
import {TopicInterface} from '../types/topic/topic.interface';
import {TopicQuestionInterface} from '../types/topic/topic-question.interface';
import {FormGroup} from '@angular/forms';
import {NavStatusEnum} from '../enums/nav.status.enum';
import {EventNavItemInterface} from '../types/page-nav/nav-item.interface';
import {EventInterface} from '../types/event/event.interface';

@Injectable({
  providedIn: 'root'
})
export class UpdateEventService {
  private eventService = inject(EventService);
  private activeQuestion = signal<TopicQuestionInterface>({} as TopicQuestionInterface);
  private formGroup: FormGroup = new FormGroup({});
  private isQuestionSkipped = false;

  updateEventTopics(activeQuestion: TopicQuestionInterface, form: FormGroup, isSkip: boolean = false) {
    this.formGroup = form;
    this.isQuestionSkipped = isSkip;
    this.activeQuestion.update(() => {
      return {
        ...activeQuestion,
      }
    });
    this.updateCurrentEventTopics(activeQuestion);
  }

  setEventActiveTopicStatus(item: EventNavItemInterface) {
    this.eventService.currentEvent.update(event => ({
      ...event,
      topics: event.topics.map((t) => {
        return {
          ...t,
          isCurrent: t.id === item.id,
        };
      })
    }));
  }

  updateEventQuestionCurrentStatus(id: number) {
    this.eventService.currentEvent.update(event => ({
      ...event,
      topics: this.updateTopicCurrentStatus(id)
    }));
  }

  updateTopicsStatus(nextTopic: TopicInterface | null, isNav: boolean = false) {
    if (nextTopic) {
      this.eventService.currentEvent.update(event => ({
        ...event,
        topics: event.topics.map(topic => ({
          ...topic,
          isCurrent: topic.id === nextTopic.id,
          questions: topic.id === nextTopic.id
            ? topic.questions.map((q) => ({
              ...q,
              isCurrent: isNav && topic.id === nextTopic.id ? true : q.isCurrent,
            }))
            : topic.questions
        }))
      }));
    }
  }

  private updateCurrentEventTopics(activeQuestion: TopicQuestionInterface) {
    this.eventService.currentEvent.update(event => ({
      ...event,
      name: this.getEventName(event, activeQuestion),
      topics: this.updateTopics()
    }));
  }

  private getEventName(event: EventInterface, activeQuestion: TopicQuestionInterface) {
    const nameControlIndex = activeQuestion.controls?.findIndex(x => x.isName);
    let eventName = event.name;
    if (nameControlIndex != undefined && nameControlIndex > -1) {
      const nameFormControlKey = Object.keys(this.formGroup.controls['controls'].value)[nameControlIndex];
      eventName = this.formGroup.controls['controls'].get(nameFormControlKey)?.value;
    }

    return eventName;
  }

  private updateTopicCurrentStatus(id: number): TopicInterface[] {
    const updatedTopic = this.updateActiveTopicWithQuestions(id);
    return this.replaceUpdatedTopic(updatedTopic);
  }

  private updateActiveTopicWithQuestions(id: number): TopicInterface {
    const questions = this.updateQuestionCurrentStatus(id);
    return {
      ...this.eventService.activeTopic(),
      status: questions.some(q => q.isSkipped) ? NavStatusEnum.ALERT : NavStatusEnum.COMPLETE,
      questions: this.updateQuestionCurrentStatus(id)
    };
  }

  private updateQuestionCurrentStatus(id: number): TopicQuestionInterface[] {
    const questions = this.eventService.activeTopic().questions ?? [];
    if (!questions.length) {
      return [];
    }

    let foundCurrent = false;
    return questions.map((q) => {
      if (q.id === id) {
        foundCurrent = true;
        return {...q, isCurrent: true};
      } else if (foundCurrent && q.isSkipped) {
        return {...q, isCurrent: false, isSkipped: false};
      } else {
        return {...q, isCurrent: false};
      }
    });
  }

  private updateTopics(): TopicInterface[] {
    const updatedTopic = this.updateActiveTopicWithFormControls();
    return this.replaceUpdatedTopic(updatedTopic);
  }

  private updateActiveTopicWithFormControls(): TopicInterface {
    const updatedActiveTopic = {
      ...this.eventService.activeTopic(),
      status: this.updateTopicQuestionsWithFormValues().some(q => q.isSkipped) ? NavStatusEnum.ALERT : NavStatusEnum.COMPLETE,
      questions: this.updateTopicQuestionsWithFormValues()
    };
    this.eventService.activeTopic.update(() => updatedActiveTopic);
    return updatedActiveTopic;
  }

  private updateTopicQuestionsWithFormValues(): TopicQuestionInterface[] {
    return this.eventService.activeTopic().questions?.map(q => (q.id === this.activeQuestion().id ? {
      ...q, ...this.updateQuestionControls(),
      isSkipped: this.activeQuestion().isOptional ? false : this.isQuestionSkipped
    } : q));
  }

  private updateQuestionControls(): TopicQuestionInterface {
    return {
      ...this.activeQuestion(),
      controls: (this.activeQuestion().controls ?? []).map(c => {
        const isManuallyChanged = c.isManuallyChanged ? true : c.value !== this.formGroup.controls['controls'].get(c.name)?.value;
        return {
          ...c,
          value: this.formGroup.controls['controls'].get(c.name)?.value ?? null,
          isManuallyChanged: isManuallyChanged
        }
      })
    };
  }

  private replaceUpdatedTopic(updatedTopic: TopicInterface): TopicInterface[] {
    return this.eventService.currentEvent().topics.map(t => (t.id === updatedTopic.id ? {...t, ...updatedTopic} : t));
  }
}
