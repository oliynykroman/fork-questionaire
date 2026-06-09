import {Injectable, signal} from '@angular/core';
import {Observable, of} from 'rxjs';
import {InfoInterface} from '../types/info/info-interface';


@Injectable({
  providedIn: 'root'
})
export class InfoService {
  private infoData: InfoInterface = {logoPath: 'assets/images/copenhagen-convention-black.png'}

  data = signal<InfoInterface>({} as InfoInterface);

  getData(): Observable<InfoInterface> {
    this.data.set(this.infoData)
    return of(this.infoData);
    //return this.httpClient.get<InfoInterface>('info').pipe(
    //   tap(info => this.data.set(info)));
  }
}
