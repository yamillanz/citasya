export interface ConfirmationDialogConfig {
  message: string;
  header?: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptButtonStyleClass?: string;
  rejectButtonStyleClass?: string;
}

export interface IConfirmationDialog {
  confirm(config: ConfirmationDialogConfig): Promise<boolean>;
}
