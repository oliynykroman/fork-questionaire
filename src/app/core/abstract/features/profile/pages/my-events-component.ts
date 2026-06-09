import {Directive, inject, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {EventInterface} from '../../../../types/event/event.interface';
import {defaultButtons, EventButtons, EventsResponse} from '../../../../types/event/events-response.interface';
import {MatDialog} from '@angular/material/dialog';
import {EventService} from '../../../../services/event.service';
import {SnackBarService} from '../../../../services/snack-bar.service';
import {AuthService} from '../../../../services/auth.service';
import {Router} from '@angular/router';
import {catchError, finalize, Subscription, throwError} from 'rxjs';
import {DeleteDialogComponent} from '../../../../../shared/components/dialogs/delete-dialog/delete-dialog.component';
import {environment} from '../../../../../../environments/environment';

@Directive()
export abstract class AbstractMyEventsComponent implements OnInit, OnDestroy {
  eventList = signal<EventInterface[]>([]);
  buttons = signal<EventButtons>(defaultButtons);
  isLoaderShown = signal<boolean>(false);
  totalPages = signal<number>(0);
  page = signal<number>(1);
  pdfIsLoading = signal<boolean>(false);

  protected eventService = inject(EventService);
  protected subscription = new Subscription();
  protected authService = inject(AuthService);
  protected router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBarService = inject(SnackBarService);

  isAdmin: WritableSignal<boolean> = this.authService.isAdmin;

  ngOnInit() {
    this.getEventEntityList();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  delete(event: EventInterface) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '250px',
      data: {
        eventName: event.name,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'OK') {
        this.isLoaderShown.set(true);
        const sub = this.eventService
          .deleteEvent(event.id)
          .pipe(
            catchError((error: Error) => {
              this.snackBarService.openSnackBar(
                'Failed to delete event. Please try again later.'
              );
              return throwError(() => error);
            }),
            finalize(() => {
              this.isLoaderShown.set(false);
            })
          )
          .subscribe(() => {
            this.eventList.update((el) => {
              return el.filter((item) => item.id !== event.id);
            });
            this.snackBarService.openSnackBar('Event deleted successfully.');
          });
        this.subscription.add(sub);
      }
    });
  }

  getReport(_id: number, _eventName: string | undefined) {
    this.snackBarService.openSnackBar('PDF-звіт вимкнено у дипломній версії.');
  }

  recalculate(id: number) {
    this.isLoaderShown.set(true);
    this.eventService.recalculate(id).subscribe({
      next: (event) => {
        this.isLoaderShown.set(false);
        this.eventList.update((events) => {
          return events.map((item) => (item.id === event.id ? event : item));
        });
      },
    });
  }

  getEvent(id?: number) {
    this.router.navigate(['event/', id ?? 'new']).then();
  }

  createPostEventReport(id: number) {
    this.isLoaderShown.set(true);

    this.eventService
      .createPostEvent(id)
      .pipe(
        catchError((error: Error) => {
          this.isLoaderShown.set(false);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (event) => {
          this.isLoaderShown.set(false);
          this.router.navigate(['event/', event.id]).then();
        },
      });
  }

  protected setEventsResponse(eventsResponse: EventsResponse) {
    this.eventList.set(eventsResponse.events);
    this.totalPages.set(eventsResponse.totalPages * environment.itemsPerPage);
    this.page.set(eventsResponse.page);
    this.buttons.set({
      ...defaultButtons,
      ...eventsResponse.buttons,
    });
  }

  private getEventEntityList() {
    this.isLoaderShown.set(true);
    const sub = this.eventService
      .getEventByMemberId(this.authService.user?.id)
      .pipe(
        catchError((error: Error) => {
          this.isLoaderShown.set(false);
          return throwError(() => error);
        })
      )
      .subscribe((response: EventsResponse) => {
        this.setEventsResponse(response)
        this.isLoaderShown.set(false);
      });
    this.subscription.add(sub);
  }
}
