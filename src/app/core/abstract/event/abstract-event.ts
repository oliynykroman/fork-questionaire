import {computed, Directive, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {EventService} from '../../services/event.service';
import {EventRouteInterface} from '../../types/event/event-route.interface';
import {ActivatedRoute, NavigationEnd, Params, Router} from '@angular/router';
import {UpdateEventService} from '../../services/update-event.service';
import {
  catchError,
  distinctUntilChanged,
  filter,
  Observable,
  of,
  startWith,
  Subscription,
  switchMap,
  tap,
  throwError
} from 'rxjs';
import {EventNavItemInterface} from '../../types/page-nav/nav-item.interface';
import {TopicInterface} from '../../types/topic/topic.interface';
import {EventTopicTypeEnum} from '../../enums/event-topic-type.enum';
import {TopicQuestionInterface} from '../../types/topic/topic-question.interface';
import {NavStatusEnum} from '../../enums/nav.status.enum';
import {EventInterface} from '../../types/event/event.interface';
import {EventNavInterface} from '../../types/page-nav/nav.interface';

@Directive()
export abstract class AbstractEvent implements OnInit, OnDestroy {

  eventNavigation = computed(() => this.getNavigationConfig());
  isLoaderShown = signal<boolean>(false);

  eventService = inject(EventService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private updateEventService = inject(UpdateEventService);

  private subscription = new Subscription();

  ngOnInit() {
    this.initFlow();
  }

  ngOnDestroy() {
    this.setInitialEventValue();
    this.subscription.unsubscribe();
  }

  changeTopic(item: EventNavItemInterface) {
    const active = this.getActiveTopic(item.id);
    let topicPath = active?.type.toLowerCase();

    if (!active || !topicPath) {
      return;
    }

    let questionId = active.questions[0].id;
    this.updateEventService.updateTopicsStatus(active, true);

    this.eventService.eventRoute.update((r) => {
      return {
        ...r,
        eventTopic: active.type,
        currentQuestion: questionId
      }
    })
    this.router.navigate([`/event/${this.eventService.eventRoute().eventId}/${topicPath}/${questionId}`]).then();
  }

  initTopic() {
    const eventRoute = this.eventService.eventRoute();
    let activeTopic: TopicInterface | undefined;

    if (!eventRoute.eventTopic) {
      activeTopic = this.getActiveTopicTypeFromService() || this.eventService.currentEvent().topics[0];
      if (activeTopic) {
        this.setEventRouteData(activeTopic.type, this.getCurrentQuestionId(activeTopic));
      }
    } else {
      activeTopic = this.getActiveTopicByType(eventRoute.eventTopic);
    }

    if (activeTopic) {
      this.eventService.activeTopic.set(activeTopic);
    }
  }

  private setEventRouteData(eventTopic: EventTopicTypeEnum, currentQuestion: number): void {
    this.eventService.eventRoute.update((e) => {
      return {
        ...e,
        eventTopic,
        currentQuestion
      }
    });
  }

  private getNavigationConfig() {
    const currentEvent = this.eventService.currentEvent();
    if (!currentEvent.topics) {
      return {} as EventNavInterface;
    }
    return {
      title: currentEvent.name,
      items: currentEvent.topics.map((topic) => this.getEventNavItem(topic))
    }

  }

  private initFlow() {
    const sub = this.getEvent().pipe(
      catchError((error: Error) => {
        this.isLoaderShown.set(false);
        return throwError(() => error);
      }),
      switchMap((event) => {
        this.isLoaderShown.set(false);
        if (event.id === 0) {
          const startEventTopic: TopicInterface[] = event.topics.splice(2, event.topics.length - 1);
          const createEvent = {
            ...event,
            topics: event.topics.splice(0, 2)
          }
          this.eventService.startEventTopics.set(startEventTopic);
          this.eventService.currentEvent.set(createEvent);
        } else {
          this.eventService.currentEvent.set(event);
        }
        return this.getRouteChanges();
      })
    ).subscribe();
    this.subscription.add(sub);
  }

  private getEvent(): Observable<EventInterface> {
    this.isLoaderShown.set(true);
    const eventId: number | string = this.route.snapshot.params['eventId'];
    const idToEventId: number = eventId === 'new' ? 0 : +eventId;
    this.eventService.eventRoute.update((e) => {
      return {
        ...e,
        eventId: eventId,
      }
    });
    return idToEventId === 0 ? this.eventService.getStartEventConfig() : this.eventService.getEventById(idToEventId);
  }

  private getRouteChanges(): Observable<any> {
    let initRoutPath = false;
    return this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(this.router.url),
      switchMap(() => {
        return this.route.firstChild ? this.route.firstChild.params : of(null);
      }),
      distinctUntilChanged((prev, curr) => {
        return JSON.stringify(prev) === JSON.stringify(curr);
      }),
      tap((childParams: Params | null) => {
        if (childParams) {
          const eventTopic = EventTopicTypeEnum[childParams['eventType'].toUpperCase() as keyof typeof EventTopicTypeEnum];
          const currentQuestion = childParams['questionId'];
          this.setEventRouteData(eventTopic, currentQuestion);
        }
      }),
      tap(() => {
        this.initTopic();
        const route = this.eventService.eventRoute();
        const path = `/event/${route.eventId}/${route.eventTopic.toLowerCase()}/${route.currentQuestion}`
        this.router.navigate([path], {skipLocationChange: initRoutPath}).then();
        initRoutPath = true;
        this.updateEventService.setEventActiveTopicStatus(this.getEventNavItem( this.eventService.activeTopic(), true));
      })
    );
  }

  private getActiveTopic(topicId: number): TopicInterface | undefined {
    return this.eventService.currentEvent().topics.find((topic) => topic.id === topicId);
  }

  private getActiveTopicByType(type: EventTopicTypeEnum): TopicInterface | undefined {
    return this.eventService.currentEvent().topics.find((topic) => topic.type === type);
  }

  private getCurrentQuestion(topic: TopicInterface): TopicQuestionInterface | undefined {
    return topic.questions.find((q) => q.isCurrent);
  }

  private getCurrentQuestionId(activeTopic: TopicInterface): number {
    const currentQuestion = this.getCurrentQuestion(activeTopic);
    return activeTopic.questions[0].id;
  }

  private getActiveTopicTypeFromService(): TopicInterface | undefined {
    return this.eventService.currentEvent().topics.find((topic) => topic.status === NavStatusEnum.ACTIVE);
  }

  private setInitialEventValue() {
    this.eventService.startEventTopics.set([] as TopicInterface[]);
    this.eventService.currentEvent.set({} as EventInterface);
    this.eventService.activeTopic.set({} as TopicInterface);
    this.eventService.eventRoute.set({} as EventRouteInterface);
  }

  private getEventNavItem(topic: TopicInterface, isCurrent = false): EventNavItemInterface {
    return {
      id: topic.id,
      order: topic.order,
      title: topic.name,
      status: topic.status,
      topicType: topic.type,
      isCurrent: isCurrent ? true : topic.isCurrent,
    }
  }
}
