import {Component, inject} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";

@Component({
  selector: 'app-return-to-slipped-question',
    imports: [
        MatButton,
        MatDialogActions,
        MatDialogContent,
        MatDialogTitle
    ],
  templateUrl: './return-to-skipped-question.component.html',
  styleUrl: './return-to-skipped-question.component.scss'
})
export class ReturnToSkippedQuestionComponent {
  readonly dialogRef = inject(MatDialogRef);

  backToSkipQuestion(){
    this.dialogRef.close('back_to_skipped_question');
  }
  saveEvent(){
    this.dialogRef.close('save_event');
  }
}
