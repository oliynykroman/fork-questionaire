import {Component, computed} from '@angular/core';
import {NavBarComponent} from '../../../../shared/components/nav-bar/nav-bar.component';
import {ButtonComponent} from '../../../../shared/ui/button/button.component';
import {TotalCo2SavedComponent} from '../../../../shared/components/total-co2-saved/total-co2-saved.component';
import {QuestionComponent} from '../../components/question/question.component';
import {AbstractEvent} from '../../../../core/abstract/event/abstract-event';
import {FullPageLoaderComponent} from '../../../../shared/ui/full-page-loader/full-page-loader.component';
import {EventTopicTypeEnum} from '../../../../core/enums/event-topic-type.enum';

@Component({
  selector: 'app-details',
  imports: [
    NavBarComponent,
    ButtonComponent,
    TotalCo2SavedComponent,
    QuestionComponent,
    FullPageLoaderComponent,
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent extends AbstractEvent {

  savedCo2 = computed<string>(() => {
    if (this.eventService.eventRoute().eventTopic === EventTopicTypeEnum.ACCOMMODATION) {
      return this.eventService.currentEvent()?.accomodationSavedCO2?.toString() ?? '';
    }
    if (this.eventService.eventRoute().eventTopic === EventTopicTypeEnum.VENUE) {
      return this.eventService.currentEvent()?.venueSavedCO2?.toString() ?? '';
    }
    if (this.eventService.eventRoute().eventTopic === EventTopicTypeEnum.FOOD) {
      return this.eventService.currentEvent()?.foodAndBeveragesSavedCO2?.toString() ?? '';
    }
    return '';
  });

  submit() {
    console.log(this.eventService.activeTopic());
  }
}
