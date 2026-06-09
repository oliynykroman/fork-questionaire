import {Directive, Input, model, output} from '@angular/core';
import {FormControlInterface} from '../../../types/form/form-control.interface';
import {AbstractControl} from '@angular/forms';

@Directive()
export class AbstractUiControlClass {
  @Input() control: any = {} as AbstractControl;
  element = model<FormControlInterface>({} as FormControlInterface);

  protected triggerSaveEvent = output<boolean>();

  protected triggerUpdateValue(){
    if (this.element().triggerSaveEvent){
      this.triggerSaveEvent.emit(true);
    }
  }
}
