import { InjectionToken } from '@angular/core';
import { IConfirmationDialog } from '../interfaces/confirmation-dialog.interface';

export const CONFIRMATION_DIALOG = new InjectionToken<IConfirmationDialog>('CONFIRMATION_DIALOG');
