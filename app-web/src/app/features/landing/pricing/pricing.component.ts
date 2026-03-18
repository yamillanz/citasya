import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, BadgeModule, DividerModule, AvatarModule, PanelModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent {}
