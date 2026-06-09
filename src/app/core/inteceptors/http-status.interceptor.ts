import {HttpInterceptorFn} from '@angular/common/http';
import {tap} from 'rxjs';
import {SnackBarService} from '../services/snack-bar.service';
import {inject} from '@angular/core';

export const httpStatusInterceptor: HttpInterceptorFn = (req, next) => {

  const snackBarService = inject(SnackBarService);

  return next(req).pipe(
    tap({
      error: (response) => {
        console.error(response);
        snackBarService.openSnackBar(`Error. ${response.error.message}`, 'error');
      },
    })
  );
};
