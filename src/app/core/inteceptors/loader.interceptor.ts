import {HttpInterceptorFn, HttpResponse} from '@angular/common/http';
import {inject} from '@angular/core';
import {LoaderService} from '../services/loader.service';
import {catchError, map, throwError} from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  loaderService.setLoading(true, req.url);

  return next(req)
    .pipe(
      catchError((err) => {
        loaderService.setLoading(false, req.url); // Turn off loading on error
        return throwError(() => err); // Propagate error correctly
      }),
    )
    .pipe(
      map((evt) => {
        if (evt instanceof HttpResponse) {
          loaderService.setLoading(false, req.url); // Turn off loading for successful response
        }
        return evt; // Return the event (response)
      })
    );
};
