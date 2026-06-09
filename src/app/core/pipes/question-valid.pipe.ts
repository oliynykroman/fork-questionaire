import {Pipe, PipeTransform} from '@angular/core';
import {TopicQuestionInterface} from '../types/topic/topic-question.interface';
import {FormGroup} from '@angular/forms';
import {FormControlInterface} from '../types/form/form-control.interface';

@Pipe({
  name: 'questionValid',
  standalone: true,
  pure: false //pipe should be impure to update with form
})
export class QuestionValidPipe implements PipeTransform {

  transform(activeQuestion: TopicQuestionInterface, step: number, form: FormGroup): boolean {
    const question: FormControlInterface | null = activeQuestion?.controls?.[step] ?? null;
    if (!question) {
      return false;
    }
    return !!form.controls['controls'].get(question.name)?.invalid;
  }

}
