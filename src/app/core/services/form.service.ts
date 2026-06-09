import {inject, Injectable} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {FormControlInterface} from '../types/form/form-control.interface';
import {TopicQuestionInterface} from '../types/topic/topic-question.interface';
import {FormControlTypeEnum} from '../enums/form-control-type.enum';

@Injectable()
export class FormService {

  private fb = inject(FormBuilder);

  createForm(question: TopicQuestionInterface): FormGroup {
    return this.fb.group({
      questionId: this.fb.control(question.questionId),
      isCurrent: this.fb.control(question.isCurrent),
      controls: this.getConditionalForm(question),
    }, {validators: question.totalSum ? this.totalPercentageValidator : question.isSingleCheckbox ? this.singleCheckBoxValidator : null});
  }

  private totalPercentageValidator(control: AbstractControl): ValidationErrors | null {
    if (!control || !control.get('controls')) return null;

    const group = control.get('controls') as FormGroup;
    if (!group || !group.value) return null;

    const values = Object.values(group.value);
    const total = Math.round(values.reduce((sum: number, val: any) => sum + (parseFloat(val) || 0), 0) * 10) / 10;

    return total === 100 ? null : {totalNot100: {total}};
  }

  private singleCheckBoxValidator(control: AbstractControl): ValidationErrors | null {
    if (!control || !control.get('controls')) return null;

    const group = control.get('controls') as FormGroup;
    if (!group || !group.value) return null;

    const values = Object.values(group.value);

    return values.some((v)=> v) ? null : {isRequired: 'Check at least one checkbox'}
  }


  private getConditionalForm(question: TopicQuestionInterface): FormGroup | FormArray | null {
    if (question.controls) {
      return this.generateFormGroup(question.controls);
    }
    return null;
  }

  private generateFormGroup(controls: FormControlInterface[]): FormGroup {
    const formGroup = this.fb.group({});
    controls.forEach(control => {
      return this.addControlIntoGroup(formGroup, control);
    });
    return formGroup;
  }

  private addControlIntoGroup(formGroup: FormGroup, control: FormControlInterface) {
    formGroup.addControl(control.name, this.createControl(control));
  }

  private createControl(control: FormControlInterface): AbstractControl {
    const validators: ValidatorFn | null = this.getValidator(control);

    return new FormControl(
      {value: control.value, disabled: false},
      validators?.length ? validators : null
    );
  }

  private getValidator(control: FormControlInterface): ValidatorFn | null {
    if (control.type === FormControlTypeEnum.TEXT || control.type === FormControlTypeEnum.TEXTAREA || control.type === FormControlTypeEnum.RADIO || control.type === FormControlTypeEnum.NUMBER) {
      return Validators.required;
    }
    return null;
  }
}
