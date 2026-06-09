import {Component, inject, Input, input, OnInit, output, signal} from '@angular/core';
import {ButtonComponent} from '../../ui/button/button.component';
import {EventInterface} from '../../../core/types/event/event.interface';
import {EventRouteInterface} from '../../../core/types/event/event-route.interface';
import {EventService} from '../../../core/services/event.service';
import {Router} from '@angular/router';
import {defaultButtons, EventButtons} from '../../../core/types/event/events-response.interface';
import {TotalCo2SavedComponent} from '../total-co2-saved/total-co2-saved.component';
import {UncompletedTopicsPipe} from '../../../core/pipes/uncompleted-topics.pipe';

@Component({
  selector: 'app-event',
  imports: [
    ButtonComponent,
    TotalCo2SavedComponent,
    UncompletedTopicsPipe
  ],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent implements OnInit {
  event = input<EventInterface>({} as EventInterface);
  isAdmin = input<boolean>(false);
  @Input() buttons: EventButtons = defaultButtons;
  eventIsNotCompleteRoute = signal<EventRouteInterface | null>(null);

  getReportClick = output<number>();
  recalculateClick = output<number>();
  createPostEventReportClick = output<number>();
  deleteEventClick = output<EventInterface>();
  navToEventClick = output<number>();

  private eventService = inject(EventService);
  private router = inject(Router);


  ngOnInit() {
    this.getEventCompleteStatus();
  }

  navToSkippedQuestion(id: number) {
    const route = this.eventIsNotCompleteRoute();
    if (route) {
      this.router.navigate([`event/${route?.eventId}/${route?.eventTopic}`, route?.currentQuestion]).then();
    } else {
      this.navToEventClick.emit(id);
    }
  }


  getReport(id: number) {
    this.getReportClick.emit(id);
  }

  recalculate(id: number) {
    this.recalculateClick.emit(id);
  }

  createPostEventReport(id: number) {
    this.createPostEventReportClick.emit(id);
  }

  deleteEvent(event: EventInterface) {
    this.deleteEventClick.emit(event);
  }

  navToEventEvent(id: number) {
    this.navToEventClick.emit(id);
  }

  isStatusReporting() {
    const event = this.event();
    for (const topic of event.topics || []) {
      for (const question of topic.questions || []) {
        const found = (question.controls || []).find(control => control.formulaKey === 'inputD8');
        if (found) {
          return found.value == "Reporting after event";
        }
      }
    }
    return false;
  }

  private getEventCompleteStatus() {
    this.eventIsNotCompleteRoute.set(this.eventService.getSkippedQuestionData(this.event()));
  }
}
