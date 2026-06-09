import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, withInMemoryScrolling} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {loaderInterceptor} from './core/inteceptors/loader.interceptor';
import {IMAGE_LOADER, ImageLoaderConfig} from '@angular/common';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideAnimations} from '@angular/platform-browser/animations';
import {httpStatusInterceptor} from './core/inteceptors/http-status.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes, withInMemoryScrolling({scrollPositionRestoration: 'top'})),
    provideAnimations(),
    provideHttpClient(
      withFetch(),
      withInterceptors([loaderInterceptor, httpStatusInterceptor])
    ),
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig) => {
        if (config.src.startsWith('/media/')) {
          return '/assets/images/transportation1.jpg';
        }

        return config.src;
      },
    }, provideAnimationsAsync()
  ],
};
