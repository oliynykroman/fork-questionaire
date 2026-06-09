import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {RouterLink} from '@angular/router';
import {AuthService} from '../../../../../core/services/auth.service';
import {Subscription} from 'rxjs';
import {SnackBarService} from '../../../../../core/services/snack-bar.service';

@Component({
  selector: 'app-email',
  imports: [
    FormsModule,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './email.component.html',
  styleUrl: './email.component.scss',
})
export class EmailComponent implements OnInit, OnDestroy {
  emailForm: FormGroup = new FormGroup({});

  private authService = inject(AuthService);
  private snackBarService = inject(SnackBarService);

  private subscription = new Subscription();

  private fb: FormBuilder = inject(FormBuilder);

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  submit() {
    const {email} = this.emailForm.value;
    const sub = this.authService.sendForgotPasswordEmail(email).subscribe(() => this.snackBarService.openSnackBar(`Please check your email.`));
    this.subscription.add(sub);
  }

  private initForm() {
    this.emailForm = this.fb.group({
      email: this.fb.control('', [Validators.required, Validators.email]),
    });
  }
}
