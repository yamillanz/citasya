import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'p-card',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="p-card"><ng-content></ng-content></div>'
})
export class PCardMock {}

@Component({
  selector: 'p-button',
  standalone: true,
  imports: [CommonModule],
  template: '<button class="p-button"><ng-content></ng-content></button>'
})
export class PButtonMock {
  @Input() label?: string;
  @Input() icon?: string;
  @Input() severity?: string;
  @Input() size?: string;
  @Input() loading?: boolean;
  @Input() disabled?: boolean;
  @Input() text?: boolean;
  @Input() outlined?: boolean;
  @Input() routerLink?: string | any[];
}

@Component({
  selector: 'p-avatar',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="p-avatar"><ng-content></ng-content></div>'
})
export class PAvatarMock {
  @Input() label?: string;
  @Input() image?: string;
  @Input() size?: string;
  @Input() shape?: string;
  @Input() style?: any;
  @Input() styleClass?: string;
}

@Component({
  selector: 'p-tag',
  standalone: true,
  imports: [CommonModule],
  template: '<span class="p-tag"><ng-content></ng-content></span>'
})
export class PTagMock {
  @Input() value?: string;
  @Input() severity?: string;
  @Input() styleClass?: string;
}

@Component({
  selector: 'p-divider',
  standalone: true,
  imports: [CommonModule],
  template: '<hr class="p-divider" />'
})
export class PDividerMock {}

@Component({
  selector: 'p-input-text',
  standalone: true,
  imports: [CommonModule],
  template: '<input class="p-inputtext" />'
})
export class PInputTextMock {
  @Input() type?: string;
  @Input() placeholder?: string;
}

@Component({
  selector: 'p-input-number',
  standalone: true,
  imports: [CommonModule],
  template: '<input class="p-inputnumber" type="number" />'
})
export class PInputNumberMock {
  @Input() min?: number;
  @Input() showButtons?: boolean;
  @Input() buttonLayout?: string;
  @Input() mode?: string;
  @Input() currency?: string;
  @Input() locale?: string;
  @Input() minFractionDigits?: number;
}

@Component({
  selector: 'p-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: '<select class="p-dropdown"><ng-content></ng-content></select>'
})
export class PDropdownMock {
  @Input() options?: any[];
  @Input() optionLabel?: string;
  @Input() optionValue?: string;
  @Input() placeholder?: string;
  @Input() showClear?: boolean;
  @Input() styleClass?: string;
}

@Component({
  selector: 'p-calendar',
  standalone: true,
  imports: [CommonModule],
  template: '<input class="p-calendar" type="date" />'
})
export class PCalendarMock {
  @Input() showIcon?: boolean;
  @Input() dateFormat?: string;
  @Input() placeholder?: string;
  @Input() maxDate?: Date;
  @Input() styleClass?: string;
  @Input() inputStyleClass?: string;
}

@Component({
  selector: 'p-table',
  standalone: true,
  imports: [CommonModule],
  template: '<table class="p-table"><ng-content></ng-content></table>'
})
export class PTableMock {
  @Input() value?: any[];
  @Input() paginator?: boolean;
  @Input() rows?: number;
  @Input() styleClass?: string;
  @Input() emptyMessage?: string;
}

@Component({
  selector: 'p-toast',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="p-toast"></div>'
})
export class PToastMock {}

@Component({
  selector: 'p-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="p-confirm-dialog"></div>'
})
export class PConfirmDialogMock {}

@Component({
  selector: 'p-checkbox',
  standalone: true,
  imports: [CommonModule],
  template: '<input type="checkbox" class="p-checkbox" />'
})
export class PCheckboxMock {
  @Input() binary?: boolean;
  @Input() value?: any;
  @Input() inputId?: string;
}

@Component({
  selector: 'p-dialog',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="p-dialog"><ng-content></ng-content></div>'
})
export class PDialogMock {
  @Input() header?: string;
  @Input() modal?: boolean;
  @Input() closable?: boolean;
  @Input() style?: any;
  @Input() visible?: boolean;
}

@Component({
  selector: 'p-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="p-sidebar"><ng-content></ng-content></div>'
})
export class PSidebarMock {
  @Input() visible?: boolean;
  @Input() baseZIndex?: number;
  @Input() style?: any;
}

@Component({
  selector: 'p-menu',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="p-menu"></div>'
})
export class PMenuMock {}

// Export all mocks
export const PrimeNGMocks = [
  PCardMock,
  PButtonMock,
  PAvatarMock,
  PTagMock,
  PDividerMock,
  PInputTextMock,
  PInputNumberMock,
  PDropdownMock,
  PCalendarMock,
  PTableMock,
  PToastMock,
  PConfirmDialogMock,
  PCheckboxMock,
  PDialogMock,
  PSidebarMock,
  PMenuMock
];
