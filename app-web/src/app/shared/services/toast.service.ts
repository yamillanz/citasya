import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private messageService = inject(MessageService);

  success(detail: string, summary = 'Éxito'): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 3000
    });
  }

  error(detail: string, summary = 'Error'): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      sticky: true
    });
  }

  warn(detail: string, summary = 'Advertencia'): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: 5000
    });
  }

  info(detail: string, summary = 'Información'): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: 3000
    });
  }

  clear(): void {
    this.messageService.clear();
  }
}
