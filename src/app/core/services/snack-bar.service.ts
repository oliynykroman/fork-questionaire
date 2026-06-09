import {inject, Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {
  private snackBar = inject(MatSnackBar);
  private horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  private verticalPosition: MatSnackBarVerticalPosition = 'top';

  openSnackBar(message: string, statusCssClass: 'success' | 'error' | 'alert' = 'success') {
    this.snackBar.open(message, 'Close', {
      duration:3000,
      panelClass: statusCssClass,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
}
