import { inject, Pipe, type PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'appSafeHtml',
})
export class SafeHtmlPipe implements PipeTransform {

  sanitizer = inject(DomSanitizer);

  transform(value: string | undefined): SafeHtml |undefined {
    if (value){
    return this.sanitizer.bypassSecurityTrustHtml(value);
    }
    return value;
  }
}
