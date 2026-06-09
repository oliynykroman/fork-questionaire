import {
  inject,
  Injectable,
  PLATFORM_ID,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {Observable, of, tap} from 'rxjs';
import {EventInterface} from '../types/event/event.interface';
import {TopicInterface} from '../types/topic/topic.interface';
import {EventRouteInterface} from '../types/event/event-route.interface';
import {defaultButtons, EventsResponse} from '../types/event/events-response.interface';
import mockQuestionnaire from '../../../../mock_questionaire.json';
import mockQuestionnaireList from '../../../../mock_questionaire_list.json';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  currentEvent = signal<EventInterface>({} as EventInterface);
  startEventTopics = signal<TopicInterface[]>([]);
  activeTopic = signal<TopicInterface>({} as TopicInterface);
  totalSavedCo2 = signal<string>('');
  eventRoute = signal<EventRouteInterface>({} as EventRouteInterface);
  isPdfGenerates = signal<boolean>(false);

  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'MOCK_IT_QUESTIONNAIRES';

  getEventById(eventId: number): Observable<EventInterface> {
    const event = this.getStoredEvents().find(item => item.id === eventId) ?? this.createMockEvent(eventId);
    return of(this.clone(event))
      .pipe(tap((event) => this.totalSavedCo2.set(event.totalSavedCO2)));
  }

  getEventByMemberId(memberId = 0, search: string = "", page: number = 1): Observable<EventsResponse> {
    const normalizedSearch = search.trim().toLowerCase();
    const events = this.getStoredEvents().filter(event =>
      !normalizedSearch || event.name?.toLowerCase().includes(normalizedSearch)
    );

    return of({
      events,
      buttons: {
        ...defaultButtons,
        createEventButton: 'Створити опитувальник',
        editEventButton: 'Відкрити',
        createPostEventButton: 'Створити копію',
        editPostEventButton: 'Редагувати копію',
        getReportButton: 'Звіт',
        getPostEventReportButton: 'Звіт копії',
        continueButton: 'Продовжити',
        deleteEventButton: 'Видалити'
      },
      page,
      totalPages: 1
    });
  }

  getReport(eventId: number): Observable<any> {
    return of(null);
  }

  downloadMasterReport(): Observable<any> {
    return of(null);
  }

  recalculateAllReports(): Observable<any> {
    return of(null);
  }

  performDownload(response: any, fileName: string) {
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName; // Name file with event ID
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up
    window.URL.revokeObjectURL(url);
  }

  recalculate(eventId: number): Observable<EventInterface> {
    return this.getEventById(eventId);
  }

  saveEvent(): Observable<EventInterface> {
    const event = {
      ...this.currentEvent(),
      id: this.getNextEventId(),
    };
    this.upsertStoredEvent(event);
    return of(this.clone(event))
      .pipe(tap((event) => this.currentEvent.set(event)));
  }

  updateEvent(id: number): Observable<EventInterface> {
    const event = {
      ...this.currentEvent(),
      id,
    };
    this.upsertStoredEvent(event);
    return of(this.clone(event))
      .pipe(tap((event) => this.currentEvent.set(event)));
  }

  deleteEvent(eventId: number): Observable<EventInterface> {
    const events = this.getStoredEvents();
    const deletedEvent = events.find(event => event.id === eventId) ?? this.createMockEvent(eventId);
    this.setStoredEvents(events.filter(event => event.id !== eventId));
    return of(this.clone(deletedEvent));
  }

  getStartEventConfig(): Observable<EventInterface> {
    const event = {
      ...this.createMockEvent(0),
      id: 0,
      name: 'Новий опитувальник'
    };
    return of(this.clone(event))
      .pipe()
      .pipe(tap((event) => this.totalSavedCo2.set(event.totalSavedCO2)));
  }

  createPostEvent(id: number): Observable<EventInterface> {
    const source = this.getStoredEvents().find(event => event.id === id) ?? this.createMockEvent(id);
    const event = {
      ...this.clone(source),
      id: this.getNextEventId(),
      name: `${source.name ?? 'Опитувальник'} - копія`,
      planningEventId: id,
      postEventId: 0,
      isPostEventReport: false
    };
    this.upsertStoredEvent(event);
    return of(event)
      .pipe(tap((event) => this.totalSavedCo2.set(event.totalSavedCO2)));
  }

  getSkippedQuestionData(event: EventInterface): EventRouteInterface | null {
    const {id: eventId, topics} = event;

    for (const topic of topics) {
      const skippedQuestion = topic.questions.find(
        (q) => q.isSkipped && !q.isOptional
      );
      if (skippedQuestion) {
        return {
          eventId,
          eventTopic: String(topic.type).toLowerCase(),
          currentQuestion: skippedQuestion.id,
        } as EventRouteInterface;
      }
    }

    return null;
  }

  private getStoredEvents(): EventInterface[] {
    const browserEvents = this.getBrowserStoredEvents();
    if (browserEvents.length) {
      return browserEvents;
    }

    const response = this.clone(mockQuestionnaireList) as unknown as EventsResponse;
    return (response.events ?? []).map(event => this.normalizeEvent(event));
  }

  private getBrowserStoredEvents(): EventInterface[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    const value = localStorage.getItem(this.storageKey);
    if (!value) {
      return [];
    }

    try {
      return (JSON.parse(value) as EventInterface[]).map(event => this.normalizeEvent(event));
    } catch {
      localStorage.removeItem(this.storageKey);
      return [];
    }
  }

  private setStoredEvents(events: EventInterface[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, JSON.stringify(events.map(event => this.normalizeEvent(event))));
    }
  }

  private upsertStoredEvent(event: EventInterface): void {
    const normalizedEvent = this.normalizeEvent(event);
    const events = this.getStoredEvents();
    const nextEvents = events.some(item => item.id === normalizedEvent.id)
      ? events.map(item => item.id === normalizedEvent.id ? normalizedEvent : item)
      : [normalizedEvent, ...events];

    this.setStoredEvents(nextEvents);
  }

  private getNextEventId(): number {
    return Math.max(0, ...this.getStoredEvents().map(event => event.id)) + 1;
  }

  private createMockEvent(id: number): EventInterface {
    return this.normalizeEvent({
      ...(this.clone(mockQuestionnaire) as unknown as EventInterface),
      id
    });
  }

  private normalizeEvent(event: EventInterface): EventInterface {
    return this.replaceLegacyText({
      ...event,
      name: event.name && event.name !== 're' ? event.name : 'Опитувальник',
      phase: event.phase ? this.replaceText(event.phase) : 'Опитування',
      reportingOrTesting: event.reportingOrTesting ? this.replaceText(event.reportingOrTesting) : 'Демонстраційний режим',
      bureau: event.bureau ? this.replaceText(event.bureau) : 'Веб-сайт-опитувальник',
      totalSavedCO2: String(event.totalSavedCO2 ?? ''),
      planningEventId: event.planningEventId ?? 0,
      postEventId: event.postEventId ?? 0,
      emissionPerDelegatesIndex: event.emissionPerDelegatesIndex ?? 0,
      topics: event.topics ?? []
    }) as EventInterface;
  }

  private replaceLegacyText(value: unknown): unknown {
    if (typeof value === 'string') {
      return this.replaceText(value);
    }

    if (Array.isArray(value)) {
      return value.map(item => this.replaceLegacyText(item));
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, this.replaceLegacyText(item)])
      );
    }

    return value;
  }

  private replaceText(value: string): string {
    return value
      .replaceAll(['Copenhagen', 'Sustainability', 'Guide'].join(' '), 'Опитувальник')
      .replaceAll('COPENHAGEN SUSTAINABILITY GUIDE', 'ОПИТУВАЛЬНИК')
      .replaceAll('Copenhagen Convention Bureau', 'Веб-сайт-опитувальник')
      .replaceAll('DestinationFyn Convention Bureau', 'Веб-сайт-опитувальник')
      .replaceAll('Aalborg Convention Bureau', 'Веб-сайт-опитувальник')
      .replaceAll('VisitAarhus Convention Bureau', 'Веб-сайт-опитувальник')
      .replaceAll('Convention Bureau', 'Веб-сайт-опитувальник')
      .replaceAll('Copenhagen', 'Опитувальник')
      .replaceAll('copenhagen', 'опитувальник');
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
