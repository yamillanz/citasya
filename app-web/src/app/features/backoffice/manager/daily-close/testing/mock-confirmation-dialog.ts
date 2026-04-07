import { IConfirmationDialog, ConfirmationDialogConfig } from '../../../../../core/interfaces/confirmation-dialog.interface';

export class MockConfirmationDialog implements IConfirmationDialog {
  private _shouldConfirm = true;

  setShouldConfirm(value: boolean): void {
    this._shouldConfirm = value;
  }

  confirm(config: ConfirmationDialogConfig): Promise<boolean> {
    return Promise.resolve(this._shouldConfirm);
  }
}
