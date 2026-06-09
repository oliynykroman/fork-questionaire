import {Component, inject} from '@angular/core';
import {ActivatedRoute,} from '@angular/router';
import {ButtonComponent} from "../../../../../shared/ui/button/button.component";
import {EventComponent} from "../../../../../shared/components/event/event.component";
import {FullPageLoaderComponent} from "../../../../../shared/ui/full-page-loader/full-page-loader.component";
import {catchError, of} from 'rxjs';
import {AbstractMyEventsComponent} from '../../../../../core/abstract/features/profile/pages/my-events-component';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatIconButton} from '@angular/material/button';
import {switchMap} from 'rxjs/operators';
import {NgxPaginationModule} from 'ngx-pagination';
import {environment} from '../../../../../../environments/environment';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-my-events',
  imports: [
    ButtonComponent,
    EventComponent,
    FullPageLoaderComponent,
    MatFormField,
    MatIcon,
    FormsModule,
    MatInput,
    MatIconButton,
    MatSuffix,
    NgxPaginationModule,
    ReactiveFormsModule,
    MatProgressSpinner
  ],
  templateUrl: './my-events.component.html',
  styleUrl: './my-events.component.scss'
})
export class MyEventsComponent extends AbstractMyEventsComponent {

  pageSize: number = environment.itemsPerPage;
  searchForm: FormGroup | undefined;

  searchControl = new FormControl("");

  get searchValue(): string {
    return this.searchForm?.controls['search'].value?.trim() || '';
  }

  private route = inject(ActivatedRoute)

  override ngOnInit() {
    // super.ngOnInit(); // don't need to call parent ngOnint
    this.initSearchForm();
    this.listenToQueryParams();
  }

  search() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchValue.toLowerCase(),
        page: 1
      },
      queryParamsHandling: 'merge'
    }).then();
  }

  clearSearch() {
    this.searchControl.setValue('', {emitEvent: false});
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: ''
    }).then();
  }

  pageChange(page: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {page},
      queryParamsHandling: 'merge'
    }).then();
  }

  listenToQueryParams() {
    this.searchForm?.reset();
    const sub = this.route.queryParams.pipe(
      switchMap((queryParams) => {
        this.isLoaderShown.set(true);
        const search: string = queryParams['search'] || '';
        const page: number = +queryParams['page'] || 1;
        this.searchControl.setValue(search, {emitEvent: false});
        return this.eventService.getEventByMemberId(this.authService.user?.id, search, page)
      }), catchError((e) => {
        this.isLoaderShown.set(false);
        return of();
      })
    ).subscribe(response => {
      this.setEventsResponse(response);
      this.isLoaderShown.set(false);
    });
    this.subscription.add(sub);
  }

  downloadMasterReport() {
    this.isLoaderShown.set(true);
    const sub = this.eventService.downloadMasterReport().pipe(
      catchError((e) => {
        this.isLoaderShown.set(false);
        return of();
      })
    ).subscribe((response) => {
      const fileName = `Report_AllEvents.xlsx`;
      this.eventService.performDownload(response, fileName);
      this.isLoaderShown.set(false);
    });
    this.subscription.add(sub);
  }

  recalculateAll() {
    this.isLoaderShown.set(true);
    const sub = this.eventService.recalculateAllReports().pipe(
      catchError((e) => {
        this.isLoaderShown.set(false);
        return of();
      }),
      switchMap(() => this.eventService.getEventByMemberId(this.authService.user?.id).pipe(
        catchError((e) => {
          this.isLoaderShown.set(false);
          return of();
        })
      ))
    ).subscribe((response) => {
      this.setEventsResponse(response);
      this.isLoaderShown.set(false);
    });
    this.subscription.add(sub);
  }

  private initSearchForm(){
    this.searchForm = new FormGroup({
      search : new FormControl('xsa'),
    })
  }

}
