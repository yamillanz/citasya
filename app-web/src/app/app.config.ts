import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MessageService, ConfirmationService } from 'primeng/api';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { CONFIRMATION_DIALOG } from './core/tokens/confirmation-dialog.token';
import { PrimeNGConfirmationDialog } from './core/services/primeng-confirmation-dialog.service';
import { DailyCloseFacade } from './features/backoffice/manager/daily-close/daily-close.facade';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })),
    provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: '.my-app-dark',
                cssLayer: {
                    name: 'primeng',
                    order: 'primeng, theme, base'
                }
            }
        }
    }),
    MessageService,
    ConfirmationService,
    DailyCloseFacade,
    {
      provide: CONFIRMATION_DIALOG,
      useClass: PrimeNGConfirmationDialog
    }
  ]
};
