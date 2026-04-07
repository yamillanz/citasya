import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { IConfirmationDialog, ConfirmationDialogConfig } from '../interfaces/confirmation-dialog.interface';

@Injectable({
  providedIn: 'root'
})
export class PrimeNGConfirmationDialog implements IConfirmationDialog {
  constructor(private confirmationService: ConfirmationService) {}

  confirm(config: ConfirmationDialogConfig): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: config.message,
        header: config.header || 'Confirmar',
        icon: config.icon || 'pi pi-exclamation-triangle',
        acceptLabel: config.acceptLabel || 'Sí',
        rejectLabel: config.rejectLabel || 'No',
        acceptButtonStyleClass: config.acceptButtonStyleClass,
        rejectButtonStyleClass: config.rejectButtonStyleClass,
        accept: () => resolve(true),
        reject: () => resolve(false)
      });
    });
  }
}
