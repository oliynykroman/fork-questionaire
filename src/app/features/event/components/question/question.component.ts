import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  computed,
  effect,
  ElementRef,
  EventEmitter,
  Inject,
  inject,
  OnDestroy,
  Output,
  PLATFORM_ID,
  signal,
  ViewChild
} from '@angular/core';
import {isPlatformBrowser, NgOptimizedImage} from '@angular/common';
import {TopicQuestionInterface} from '../../../../core/types/topic/topic-question.interface';
import {EventTopicStepTypeEnum} from '../../../../core/enums/event-topic-step-type.enum';
import {FormControlInterface} from '../../../../core/types/form/form-control.interface';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {FormService} from '../../../../core/services/form.service';
import {FormControlTypeEnum} from '../../../../core/enums/form-control-type.enum';
import {TopicInterface} from '../../../../core/types/topic/topic.interface';
import {UpdateEventService} from '../../../../core/services/update-event.service';
import {Router} from '@angular/router';
import {catchError, Subscription, throwError} from 'rxjs';
import {switchMap, debounceTime} from 'rxjs/operators';
import {EventService} from '../../../../core/services/event.service';
import {ProgressBarComponent} from '../../../../shared/ui/progress-bar/progress-bar.component';
import {MatButton} from '@angular/material/button';
import {RadioComponent} from '../../../../shared/ui/controls/radio/radio.component';
import {CheckboxComponent} from '../../../../shared/ui/controls/checkbox/checkbox.component';
import {ProgressComponent} from '../../../../shared/ui/controls/progress/progress.component';
import {DateComponent} from '../../../../shared/ui/controls/date/date.component';
import {TextComponent} from '../../../../shared/ui/controls/text/text.component';
import {SelectComponent} from '../../../../shared/ui/controls/select/select.component';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {TextareaComponent} from '../../../../shared/ui/controls/textarea/textarea.component';
import {DateRangeComponent} from '../../../../shared/ui/controls/date-range/date-range.component';
import {NumberComponent} from '../../../../shared/ui/controls/number/number.component';
import {FullPageLoaderComponent} from '../../../../shared/ui/full-page-loader/full-page-loader.component';
import {ConditionFieldTypeEnum} from '../../../../core/enums/condition-field-type.enum';
import {EventRouteInterface} from '../../../../core/types/event/event-route.interface';
import {EventTopicTypeEnum} from '../../../../core/enums/event-topic-type.enum';
import {SafeHtmlPipe} from "../../../../core/pipes/safe-html.pipe";
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {ScorePipe} from '../../../../core/pipes/score.pipe';

@Component({
  selector: 'app-question',
  imports: [
    NgOptimizedImage,
    ReactiveFormsModule,
    MatButton,
    ProgressBarComponent,
    RadioComponent,
    CheckboxComponent,
    ProgressComponent,
    DateComponent,
    TextComponent,
    SelectComponent,
    MatIcon,
    MatIconModule,
    TextareaComponent,
    DateRangeComponent,
    NumberComponent,
    FullPageLoaderComponent,
    SafeHtmlPipe,
    MatFormField,
    MatInput,
    MatSuffix,
    ScorePipe
  ],
  providers: [FormService],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scrollable') scrollableContentRef!: ElementRef;
  @Output() submitQuiz = new EventEmitter<void>();

  activeTopic: TopicInterface = {} as TopicInterface;
  topicId = -1;
  formGroup: FormGroup = new FormGroup({});
  isBrowser = false;
  hasSaveOndemandEvent = false;

  isLoaderShown = signal<boolean>(false);
  isNewEvent = signal<boolean>(false);
  activeQuestionIndex = signal<number>(1);
  topicTotalQuestions = signal<number>(1);
  activeQuestion = computed<TopicQuestionInterface>(() => this.getInitQuestion());
  formQuestionsList = computed<FormControlInterface[]>(() => {
    const activeQuestion = this.activeQuestion();
    if (activeQuestion?.questionType === EventTopicStepTypeEnum.QUESTION) {
      this.initQuestionForm(activeQuestion);
      return activeQuestion.controls ?? [];
    }
    return [];
  });
  skippedQuestionData = computed<EventRouteInterface | null>(() =>
    this.eventService.getSkippedQuestionData(this.eventService.currentEvent())
  );

  get activeQuestions(): TopicQuestionInterface[] {
    return this.eventService.activeTopic()?.questions ?? [];
  }

  get isFirstTopic(): boolean {
    return this.eventService.currentEvent().topics[0].id === this.activeTopic.id;
  }

  get isLastTopic(): boolean {
    return this.eventService.currentEvent().topics[this.eventService.currentEvent().topics.length - 1].id === this.activeTopic.id;
  }

  protected readonly stepTypeEnum = EventTopicStepTypeEnum;
  protected readonly FormControlTypeEnum = FormControlTypeEnum;

  private formService = inject(FormService);
  private updateEventService = inject(UpdateEventService);
  private router = inject(Router);
  private eventService = inject(EventService);
  private cdRef = inject(ChangeDetectorRef);
  private subscription = new Subscription();

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    effect(() => {
      this.isBrowser = isPlatformBrowser(this.platformId);
      this.isNewEvent.set(this.eventService.eventRoute().eventId === 'new');
      const activeTopic = this.eventService.activeTopic();
      const activeTopicQuestions = activeTopic.questions.filter((q) => q.questionType === EventTopicStepTypeEnum.QUESTION);
      const questionIndex = activeTopicQuestions.findIndex((q) => q.questionId == this.eventService.eventRoute().currentQuestion);
      this.activeQuestionIndex.set(questionIndex > -1 ? questionIndex + 1 : 1);
      this.topicTotalQuestions.set(activeTopicQuestions.length);
      if (this.topicId !== activeTopic.id) {
        this.topicId = activeTopic.id;
      }
      setTimeout(() => {
        this.hasSaveOndemandEvent = false;
      }, 200);
    });
  }

  ngAfterViewInit() {
    this.scrollQuestionTop();

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  prev(question: TopicQuestionInterface) {
    this.navigate('prev', question, question.isSkipped);
  }

  next(question: TopicQuestionInterface) {
    this.navigate('next', question, false);
  }

  skipQuestion(question: TopicQuestionInterface) {
    this.navigate('next', question, true);
  }

  saveQuiz(isSkip:boolean = false) {
    this.isLoaderShown.set(true);
    if (this.eventService.eventRoute().eventId === 'new') {
      this.eventService.currentEvent.update((e) => {
        return {
          ...e,
          topics: [
            ...e.topics,
            ...this.eventService.startEventTopics()
          ]
        }
      });
      this.updateEventService.updateEventTopics(this.activeQuestion(), this.formGroup, isSkip);
      const sub = this.eventService.saveEvent().pipe(
        catchError((error) => {
          this.isLoaderShown.set(false);
          return throwError(() => error);
        })
      ).subscribe((event) => {
        this.isLoaderShown.set(false);
        this.eventService.currentEvent.update((e) => {
          return {
            ...e,
            id: event.id,
            totalSavedCO2: e.totalSavedCO2
          }
        });
        const topic = this.nextTopic();
        if (topic) {
          this.navigateToTopic(topic);
        }
      });
      this.subscription.add(sub);
    } else {
      const sub = this.eventService.updateEvent(this.eventService.currentEvent().id).pipe(
        catchError((error) => {
          this.isLoaderShown.set(false);
          return throwError(() => error);
        })
      ).subscribe(() => {
        this.isLoaderShown.set(false);
      });
      this.subscription.add(sub);
    }
  }

  saveAllQuiz() {
    this.isLoaderShown.set(true);
    if (this.eventService.eventRoute().eventId === 'new') {
      this.eventService.currentEvent.update((e) => {
        return {
          ...e,
          topics: [
            ...e.topics,
            ...this.eventService.startEventTopics()
          ]
        }
      });
      this.updateEventService.updateEventTopics(this.activeQuestion(), this.formGroup, false);
      const sub = this.eventService.saveEvent().pipe(
        catchError((error) => {
          this.isLoaderShown.set(false);
          return throwError(() => error);
        })
      ).subscribe((event) => {
        this.isLoaderShown.set(false);
        this.eventService.currentEvent.update((e) => {
          return {
            ...e,
            id: event.id,
            totalSavedCO2: event.totalSavedCO2
          }
        });
        const topic = this.nextTopic();
        if (topic) {
          this.navigateToTopic(topic);
        }
      });
      this.subscription.add(sub);
    } else {
      const sub = this.eventService.updateEvent(this.eventService.currentEvent().id).pipe(
        catchError((error) => {
          this.isLoaderShown.set(false);
          return throwError(() => error);
        })
      ).subscribe(() => {
        this.isLoaderShown.set(false);
        this.router.navigate(['']).then();
      });
      this.subscription.add(sub);
    }
  }

  returnToSkipQuestion() {
    const skippedQuestionData = this.skippedQuestionData();
    if (skippedQuestionData) {
      const {eventId, eventTopic, currentQuestion} = skippedQuestionData;
      const nextTopic = this.getTopicByType(eventTopic);
      if (nextTopic) {
        this.updateEventService.updateTopicsStatus(nextTopic);
        this.router.navigate([`event/${eventId}/${eventTopic}`, currentQuestion]).then();
      }
    }
  }

  /*
  Method updates even without save on demand for example when specific logic from of for amount of control changing
   */
  updateEventOnDemand() {
    this.updateEventService.updateEventTopics(this.activeQuestion(), this.formGroup, false);
    this.cdRef.markForCheck();
  }

  /**
   * Method updates form controls in current question for single selected checkbox
   * @param controlName
   */
  updateOnlySingeCheckbox(controlName: string) {
    const activeQuestion = this.activeQuestion();

    if (!activeQuestion.isSingleCheckbox || !activeQuestion.controls) return;

    const controlsGroup = this.formGroup.get('controls');

    if (!controlsGroup) return;

    activeQuestion.controls
      .filter(control => control.type === FormControlTypeEnum.CHECKBOX)
      .forEach(control => {
        const formControl = controlsGroup.get(control.name);
        formControl?.patchValue(control.name === controlName);
      });
  }

  isLastTopicQuestion(question: TopicQuestionInterface) {
    const arr = this.activeTopic.questions;
    return arr.length > 0 && arr[arr.length - 1].id === question.id;
  }

  isFirstTopicQuestion(question: TopicQuestionInterface) {
    const arr = this.activeTopic.questions;
    return arr.length > 0 && arr[0].id === question.id;
  }

  private getInitQuestion(): TopicQuestionInterface {
    const route = this.eventService.eventRoute();
    const activeTopic = this.eventService.currentEvent().topics.find((t) => t.type === route.eventTopic);
    if (activeTopic) {
      this.activeTopic = activeTopic;
      const question = activeTopic.questions.find(q => q.id === +route.currentQuestion);
      if (question) {
        return question;
      }
      return activeTopic.questions[0];
    }
    this.activeTopic = this.eventService.currentEvent().topics[0];
    return this.activeTopic.questions[0];
  }

  private initQuestionForm(activeQuestion: TopicQuestionInterface | undefined) {
    if (activeQuestion) {
      this.formGroup = this.formService.createForm(activeQuestion);
    }
  }

  private getCurrentQuestionIndex(question: TopicQuestionInterface): number {
    return this.activeQuestions.findIndex(q => q.id === question.id);
  }

  private navigate(direction: 'prev' | 'next', question: TopicQuestionInterface, isSkip = false) {
    if (question.questionType === EventTopicStepTypeEnum.QUESTION) {
      this.updateEventService.updateEventTopics(this.activeQuestion(), this.formGroup, isSkip);
    }

    const nextQuestionId = this.getNextQuestionId(this.eventService.activeTopic(), this.getCurrentQuestionIndex(question), direction);
    if (nextQuestionId !== null) {
      this.navigateToStep(nextQuestionId);
    } else {

      const topic = direction === 'next' ? this.nextTopic() : this.prevTopic();
      if (topic) {
        this.navigateToTopic(topic, direction);
      }
    }

    if (this.eventService.eventRoute().eventId === 'new' && this.isLastTopicQuestion(question) && this.isLastTopic && direction === 'next') {
      this.saveQuiz(isSkip);
    } else {
      if (this.eventService.eventRoute().eventId !== 'new') {
        this.saveQuiz(isSkip);
      }
    }
  }

  private navigateToStep(questionId: number) {
    if (questionId) {
      this.updateEventService.updateEventQuestionCurrentStatus(questionId);
      const route = this.eventService.eventRoute;
      this.eventService.eventRoute.update((r) => {
        return {
          ...r,
          currentQuestion: questionId
        }
      });
      const path = `event/${route().eventId}/${route().eventTopic.toLowerCase()}`;
      this.router.navigate([path, questionId]).then();
    }
  }

  private navigateToTopic(topic: TopicInterface, direction: 'prev' | 'next' = 'next') {
    const nextTopicActiveQuestionIndex = this.getTopicActiveQuestionIndex(topic, direction);
    const topicTypeUrlPath = topic?.type.toLowerCase();
    const eventId = this.eventService.currentEvent().id === 0 ? 'new' : this.eventService.currentEvent().id;
    this.updateEventService.updateTopicsStatus(topic);
    this.eventService.eventRoute.update((r) => {
      return {
        ...r,
        eventId: eventId,
        eventTopic: topic?.type,
        currentQuestion: topic.questions[nextTopicActiveQuestionIndex].id
      }
    });
    this.router.navigate([`event/${eventId}/${topicTypeUrlPath}`, topic.questions[nextTopicActiveQuestionIndex].id]).then();
  }

  private nextTopic(): TopicInterface | null {
    const eventTopics = this.eventService.currentEvent().topics;
    const activeTopicId = this.eventService.activeTopic().id;
    const index = eventTopics.findIndex(obj => obj.id === activeTopicId);
    return (index !== -1 && index < eventTopics.length - 1) ? eventTopics[index + 1] : null;
  }

  private prevTopic(): TopicInterface | null {
    const eventTopics = this.eventService.currentEvent().topics;
    const activeTopicId = this.eventService.activeTopic().id;
    const index = eventTopics.findIndex(obj => obj.id === activeTopicId);
    return (index !== -1 && index > 0) ? eventTopics[index - 1] : null;
  }

  private getTopicByType(topicType: EventTopicTypeEnum): TopicInterface | undefined {
    return this.eventService.currentEvent().topics.find(topic => topic.type.toLowerCase() === topicType.toLowerCase());
  }

  private getTopicActiveQuestionIndex(topic: TopicInterface, direction: 'prev' | 'next' = 'next'): number {
    if (direction === 'next') {
      return 0;
    }
    return topic.questions.length - 1;
  }

  private getNextQuestionId(topic: TopicInterface, currentQuestionId: number, direction: 'next' | 'prev'): number | null {
    const questions = topic.questions;
    const step = direction === 'next' ? 1 : -1;
    let index = currentQuestionId + step;

    while (index >= 0 && index < questions.length) {
      const question = questions[index];
      if (!question.conditionFieldName) {
        return question.id;
      }

      const conditionFields = question.conditionFieldName.split(',').map(f => f.trim());
      const conditionValues = question.conditionFieldValue?.toString().split(',').map(v => v.trim().toLowerCase()) || [];
      let isValidCondition = true;

      //hardcode only for one specific case with food policies
      if (question.controls?.find((x) => x.uniqueName === 'foodpolicies')) {
        const mealsperdelegateValue = Number(topic.questions.map((q) => q.controls?.find((c) => c.uniqueName === 'mealsperdelegate')).find(Boolean)?.value);
        const mealsintotalValue = Number(topic.questions.map((q) => q.controls?.find((c) => c.uniqueName === 'mealsintotal')).find(Boolean)?.value);
        const policiestypeValue = topic.questions.map((q) => q.controls?.find((c) => c.uniqueName === 'policiestype')).find(Boolean)?.value.toString();

        if (mealsperdelegateValue + mealsintotalValue > 0 && policiestypeValue?.toLowerCase() == 'same') {
          return question.id;
        }
      }

      for (let i = 0; i < conditionFields.length; i++) {
        const field = conditionFields[i];
        const expectedValue = conditionValues[i];
        let fieldMatched = false;

        for (let q = 0; q < topic.questions.length; q++) {
          const controls = topic.questions[q].controls;
          if (!controls) continue;

          for (let c = 0; c < controls.length; c++) {
            const control = controls[c];
            const controlValue = String(control.value).toLowerCase();
            if (question.conditionFieldType !== ConditionFieldTypeEnum.NOT_EQUAL) {
              if (control.name === field && controlValue === expectedValue) {
                fieldMatched = true;
                break;
              }
            } else {
              if (control.name === field && controlValue !== expectedValue) {
                fieldMatched = true;
                break;
              }
            }
          }

          if (fieldMatched) break;
        }

        if (!fieldMatched) {
          isValidCondition = false;
          break;
        }
      }

      if (isValidCondition) {
        return question.id;
      }

      index += step;
    }

    return null;
  }

  private scrollQuestionTop() {
    if (isPlatformBrowser(this.platformId)) {
      const sub = this.router.events.subscribe(() => {
        const container = this.scrollableContentRef?.nativeElement;
        container?.scrollTo({top: 0, behavior: 'auto'});
      });
      this.subscription.add(sub);
    }
  }

  recalculateVenueEmission(field: FormControlInterface) {
    field.isManuallyChanged = false;
    this.isLoaderShown.set(true);
    this.updateEventOnDemand();
    const sub = this.eventService.updateEvent(this.eventService.currentEvent().id)
      .subscribe(() => {
        this.isLoaderShown.set(false);
        this.hasSaveOndemandEvent = false;
      });
    this.subscription.add(sub);
  }

  /**
   * Automatically saves the current form state after it stabilizes.
   *
   * This method subscribes to the form's value changes, waits 500ms
   * after the last change (using debounceTime), and only proceeds
   * if the form data has changed (checked via distinctUntilChanged).
   *
   * Once a change is detected, it triggers an update of event data
   * via updateEventOnDemand() and then calls the backend API
   * to persist the changes using eventService.updateEvent().
   *
   * This ensures that the form is not saved repeatedly for each
   * control update, but only once after the user has finished editing.
   *
   * @param event - A flag that can be used for external triggering (currently unused)
   */
  saveOnDemand(event: boolean) {
    if (this.hasSaveOndemandEvent) {
      return
    }
    this.hasSaveOndemandEvent = true;
    const sub = this.formGroup.valueChanges.pipe(
      debounceTime(300),
      switchMap(() => {
        this.isLoaderShown.set(true);
        this.updateEventOnDemand();
        return this.eventService.updateEvent(this.eventService.currentEvent().id);
      }),
      catchError((error) => {
        this.isLoaderShown.set(false);
        return throwError(() => error);
      })
    ).subscribe(() => {
      this.isLoaderShown.set(false);
      this.hasSaveOndemandEvent = false;
    });

    this.subscription.add(sub);
  }

}
