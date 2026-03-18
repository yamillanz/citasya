import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, AccordionModule, CardModule, DividerModule, PanelModule, AvatarModule, ButtonModule, RouterLink],
  templateUrl: './faq.component.html'
})
export class FaqComponent {}
