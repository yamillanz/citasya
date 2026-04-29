import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { ConfirmationService } from 'primeng/api';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaUpdateService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly confirmationService = inject(ConfirmationService);

  constructor() {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates
      .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe(() => {
        this.showUpdateConfirm();
      });

    this.swUpdate.unrecoverable.subscribe(() => {
      this.confirmationService.confirm({
        header: 'Error irrecuperable',
        message: 'Ocurrió un error que requiere recargar la página.',
        acceptLabel: 'Recargar',
        rejectVisible: false,
        closable: false,
        accept: () => {
          document.location.reload();
        }
      });
    });
  }

  private showUpdateConfirm(): void {
    this.confirmationService.confirm({
      header: 'Actualización disponible',
      message: 'Hay una nueva versión de holacitas. ¿Deseas actualizar ahora?',
      acceptLabel: 'Actualizar',
      rejectLabel: 'Después',
      accept: () => {
        this.swUpdate.activateUpdate().then(() => {
          document.location.reload();
        });
      }
    });
  }
}
